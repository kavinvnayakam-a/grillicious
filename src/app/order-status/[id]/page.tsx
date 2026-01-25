"use client"

import { useEffect, useState, useRef } from 'react';
import { db } from '@/firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { ChefHat, CheckCircle2, Timer, Zap, Play, Clock } from 'lucide-react';

interface GrillPipe {
  x: number;
  top: number;
  bottom: number;
  passed: boolean;
}

export default function OrderStatusPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const [status, setStatus] = useState('Pending');
  const [orderData, setOrderData] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [isGrilled, setIsGrilled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); 
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- 1. PREVENT BACK NAVIGATION ---
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- 2. FIREBASE LISTENER ---
  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "orders", id), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setStatus(data.status);
        setOrderData(data);
        if (data.status === 'Served') router.push('/thanks'); 
      }
    });
    return () => unsub();
  }, [id, router]);

  // --- 3. AUTO-REDIRECT TIMER ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'Ready' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (status === 'Ready' && timeLeft === 0) {
      router.push('/thanks');
    }
    return () => clearInterval(timer);
  }, [status, timeLeft, router]);

  // --- 4. FULL-SCREEN CHICKEN GAME LOGIC ---
  useEffect(() => {
    if (!gameActive || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationFrameId: number;
    let birdY = canvas.height / 2;
    let velocity = 0;
    const gravity = 0.25; 
    const lift = -6;      
    let pipes: GrillPipe[] = [];
    let frameCount = 0;
    const birdX = 80;

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#18181b"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      velocity += gravity;
      birdY += velocity;
      ctx.font = "45px serif";
      ctx.textAlign = "center";
      ctx.fillText(gameActive ? "🐔" : "🍗", birdX, birdY);

      if (frameCount % 120 === 0) { 
        const gap = 240; 
        const top = Math.random() * (canvas.height - gap - 100) + 50;
        pipes.push({ x: canvas.width, top, bottom: top + gap, passed: false });
      }

      pipes.forEach((p) => {
        p.x -= 2.5; 
        ctx.fillStyle = "#d4af37";
        ctx.fillRect(p.x, 0, 60, p.top);
        ctx.fillRect(p.x, p.bottom, 60, canvas.height - p.bottom);
        
        if (birdX + 20 > p.x && birdX - 20 < p.x + 60) {
          if (birdY - 20 < p.top || birdY + 20 > p.bottom) {
            setGameActive(false);
            setIsGrilled(true);
            if ("vibrate" in navigator) navigator.vibrate(100);
          }
        }
        
        if (!p.passed && p.x + 60 < birdX) {
          setScore(prev => prev + 1);
          p.passed = true;
        }
      });

      if (birdY > canvas.height || birdY < 0) {
        setGameActive(false);
        setIsGrilled(true);
      }

      pipes = pipes.filter(p => p.x > -100);
      frameCount++;
      animationFrameId = window.requestAnimationFrame(gameLoop);
    };

    const handleJump = (e: any) => { 
      e.preventDefault(); 
      if(gameActive) velocity = lift; 
    };

    window.addEventListener('touchstart', handleJump, { passive: false });
    window.addEventListener('mousedown', handleJump);
    animationFrameId = window.requestAnimationFrame(gameLoop);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('touchstart', handleJump);
      window.removeEventListener('mousedown', handleJump);
    };
  }, [gameActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-zinc-900 font-sans overflow-hidden touch-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* --- DYNAMIC STATUS BAR --- */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50">
        <div className="bg-zinc-900/90 backdrop-blur-md border-4 border-zinc-900 rounded-[2rem] p-4 shadow-2xl">
          <div className="flex justify-between items-center mb-3 px-2">
            <div className="flex items-center gap-2">
              <Zap className="text-[#d4af37]" size={14} />
              <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">
                {orderData?.tableId === 'Takeaway' ? 'Collection' : `Table ${orderData?.tableId}`}
              </span>
            </div>
            <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest leading-none">
               #{orderData?.orderNumber || '0000'}
            </span>
          </div>

          <div className="relative h-12 w-full bg-zinc-800 rounded-2xl overflow-hidden flex items-center">
            <div 
              className={`h-full transition-all duration-1000 ${
                status === 'Pending' ? 'bg-rose-500' : status === 'Received' ? 'bg-[#d4af37]' : 'bg-emerald-500'
              }`}
              style={{ width: status === 'Pending' ? '30%' : status === 'Received' ? '65%' : '100%' }}
            />
            <div className="absolute inset-0 flex items-center justify-center gap-3">
              <span className="text-white">
                {status === 'Pending' ? <Timer className="animate-spin" size={16}/> : 
                 status === 'Received' ? <ChefHat className="animate-bounce" size={16}/> : 
                 <CheckCircle2 size={16}/>}
              </span>
              <span className="text-xs font-black uppercase italic text-white drop-shadow-md">
                {status === 'Pending' ? 'Waiting Approval' : 
                 status === 'Received' ? 'Kitchen Grilling' : 
                 'FOOD READY!'}
              </span>
            </div>
          </div>

          {status === 'Ready' && (
            <div className="mt-3 flex items-center justify-center gap-2 bg-emerald-500/10 py-2 rounded-xl border border-emerald-500/20 animate-pulse">
               <Clock size={14} className="text-emerald-500"/>
               <span className="text-[10px] font-black text-emerald-500 uppercase">
                 Auto-closing in {formatTime(timeLeft)}
               </span>
            </div>
          )}
        </div>
      </div>

      {/* --- OVERLAY: START / GAME OVER --- */}
      {!gameActive && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-8">
          <div className="bg-white border-8 border-zinc-900 p-8 rounded-[3.5rem] shadow-[15px_15px_0_0_#d4af37] text-center space-y-6 max-w-sm animate-in zoom-in-95 duration-300">
            {isGrilled ? <div className="text-7xl">🍗</div> : <div className="text-7xl animate-bounce">🐔</div>}
            
            <div>
              {/* REMOVED ROAST MESSAGE - JUST SHOWS GAME NAME */}
              <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
                GRILL HOP
              </h2>
              <p className="text-zinc-400 font-bold uppercase text-[9px] mt-2 tracking-widest leading-relaxed">
                {orderData?.tableId === 'Takeaway' ? `Takeaway Order #${orderData?.orderNumber}` : `Table ${orderData?.tableId} • Order #${orderData?.orderNumber}`}
              </p>
            </div>
            
            <button 
              onClick={() => { setScore(0); setGameActive(true); setIsGrilled(false); }}
              className="w-full bg-[#d4af37] text-zinc-900 py-5 rounded-2xl font-black uppercase italic text-lg shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
              <Play fill="currentColor" size={18} /> {isGrilled ? "TRY AGAIN" : "START GAME"}
            </button>
          </div>
        </div>
      )}

      {/* --- SCORE HUD --- */}
      {gameActive && (
        <div className="absolute bottom-10 left-10 z-50 flex items-baseline gap-2 pointer-events-none">
          <span className="text-7xl font-black italic text-[#d4af37] drop-shadow-[4px_4px_0_#000]">{score}</span>
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Points</span>
        </div>
      )}
    </div>
  );
}
