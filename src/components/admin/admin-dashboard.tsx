"use client"

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Order } from '@/lib/types';
import { OrderCard } from '@/components/admin/order-card';
import { Button } from '@/components/ui/button';
import { LogOut, UtensilsCrossed, Zap, TrendingUp, Users, ShoppingBag, Database } from 'lucide-react'; // Added Database icon
import { useToast } from '@/hooks/use-toast';
import { pushLocalMenuToFirestore } from '@/lib/sync-menu'; // Import the sync utility
import { useFirestore } from '@/firebase';

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuth, setAuth] = useLocalStorage('grillicious-admin-auth', false);
  const [orders, setOrders] = useLocalStorage<Order[]>('orders', []);
  const [isMounted, setIsMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false); // Loading state for sync
  const firestore = useFirestore();

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (isMounted && !isAuth) router.replace('/admin/login');
  }, [isAuth, isMounted, router]);
  
  const handleStatusUpdate = useCallback((orderId: string, status: Order['status']) => {
    setOrders(prevOrders => prevOrders.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
    toast({
      title: 'Order Updated',
      className: "bg-zinc-900 text-white border-b-4 border-[#d4af37]",
      description: `Order #${orderId.slice(0,4)} is now ${status}.`,
    });
  }, [setOrders, toast]);

  // Handle Menu Sync to Firestore
  const handleMenuSync = async () => {
    if (!firestore) {
       toast({
        variant: "destructive",
        title: "Sync Failed",
        description: "Firestore not initialized.",
      });
      return;
    }
    setIsSyncing(true);
    const result = await pushLocalMenuToFirestore(firestore);
    setIsSyncing(false);

    if (result.success) {
      toast({
        title: "Sync Successful",
        description: `Uploaded ${result.count} items to India server.`,
        className: "bg-emerald-600 text-white border-b-4 border-zinc-900",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: result.error,
      });
    }
  };

  // Analytics Calculations
  const analytics = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const todaysOrders = orders.filter(o => o.timestamp >= today);
    const totalSale = todaysOrders.reduce((acc, curr) => acc + curr.total, 0);
    
    const activeTableNumbers = new Set(
      orders.filter(o => o.status !== 'Completed').map(o => o.tableId)
    );

    return { totalSale, activeTableCount: activeTableNumbers.size, activeTableNumbers };
  }, [orders]);

  if (!isMounted || !isAuth) return null;

  const activeOrders = orders.filter(o => o.status !== 'Completed');

  return (
    <div className="min-h-screen bg-zinc-50 font-sans pb-20">
      <header className="bg-zinc-900 border-b-4 border-[#d4af37] sticky top-0 z-50 shadow-xl">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#d4af37] p-2 rounded-xl border-2 border-white">
              <UtensilsCrossed className="h-5 w-5 text-zinc-900" />
            </div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">Admin Hub</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* --- SYNC BUTTON ADDED HERE --- */}
            <Button 
              variant="outline" 
              size="sm" 
              disabled={isSyncing}
              onClick={handleMenuSync} 
              className="bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-white/20 text-[10px] font-black uppercase transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] active:shadow-none active:translate-y-1"
            >
              <Database className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`}/> 
              {isSyncing ? 'Syncing...' : 'Sync Menu'}
            </Button>

            <Button 
              variant="ghost" 
              onClick={() => { setAuth(false); router.push('/admin/login'); }} 
              className="text-white hover:bg-white/10 text-[10px] font-black uppercase"
            >
              <LogOut className="mr-2 h-4 w-4 text-[#d4af37]"/> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 space-y-10">
        
        {/* SECTION 1: TOP ANALYTICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border-4 border-zinc-900 p-6 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(212,175,55,1)]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Today's Revenue</p>
                <p className="text-4xl font-black text-zinc-900 mt-1">₹{analytics.totalSale.toLocaleString()}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-2xl"><TrendingUp className="text-emerald-600 h-6 w-6" /></div>
            </div>
          </div>

          <div className="bg-zinc-900 border-4 border-zinc-900 p-6 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(24,24,27,0.2)] text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Active Tables</p>
                <p className="text-4xl font-black text-[#d4af37] mt-1">{analytics.activeTableCount} / 12</p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl"><Users className="text-[#d4af37] h-6 w-6" /></div>
            </div>
          </div>

          <div className="bg-white border-4 border-zinc-900 p-6 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(24,24,27,0.1)]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Pending Orders</p>
                <p className="text-4xl font-black text-zinc-900 mt-1">{activeOrders.length}</p>
              </div>
              <div className="bg-zinc-100 p-3 rounded-2xl"><ShoppingBag className="text-zinc-900 h-6 w-6" /></div>
            </div>
          </div>
        </div>

        {/* SECTION 2: TABLE GRID MAP */}
        <section>
          <h2 className="text-xl font-black uppercase italic text-zinc-900 mb-4 flex items-center gap-2">
            <div className="h-2 w-2 bg-[#d4af37] rounded-full" /> Floor Map
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-3">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => {
              const isActive = analytics.activeTableNumbers.has(num.toString());
              return (
                <div key={num} className={`
                  aspect-square flex flex-col items-center justify-center rounded-2xl border-2 transition-all
                  ${isActive 
                    ? 'bg-zinc-900 border-[#d4af37] text-white shadow-[4px_4px_0px_0px_#d4af37] animate-pulse' 
                    : 'bg-white border-zinc-200 text-zinc-300'}
                `}>
                  <span className="text-xs font-black">T-{num}</span>
                  {isActive && <span className="text-[8px] uppercase mt-1 font-bold text-[#d4af37]">Live</span>}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: LIVE ORDERS */}
        <section>
          <h2 className="text-xl font-black uppercase italic text-zinc-900 mb-6 flex items-center gap-2">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" /> Active Orders
          </h2>
          {activeOrders.length === 0 ? (
            <div className="py-20 rounded-[3rem] border-4 border-dashed border-zinc-200 bg-zinc-100/50 text-center">
              <Zap className="mx-auto h-12 w-12 text-zinc-300 mb-4"/>
              <p className="font-black uppercase tracking-widest text-zinc-400 text-xs">Waiting for orders...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {activeOrders.sort((a, b) => a.timestamp - b.timestamp).map(order => (
                <OrderCard key={order.id} order={order} onStatusUpdate={handleStatusUpdate} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
