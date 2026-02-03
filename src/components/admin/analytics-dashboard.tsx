"use client"

import { useState, useEffect } from 'react';
import { db } from '@/firebase/config';
import { collection, onSnapshot, query, orderBy, where, Timestamp, getDocs } from 'firebase/firestore';
import { Order } from '@/lib/types';
import { 
    Banknote, 
    ShoppingBag, 
    Utensils, 
    TrendingUp, 
    Calendar,
    ChevronRight,
    Search
  } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AnalyticsDashboard() {
  const [liveOrders, setLiveOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // 1. Setup Date Range for the Selected Day
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);

    // 2. Listen to LIVE ORDERS (Only for today)
    const qLive = query(
      collection(db, "orders"), 
      where("timestamp", ">=", Timestamp.fromDate(start)),
      where("timestamp", "<=", Timestamp.fromDate(end))
    );

    const unsubLive = onSnapshot(qLive, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
      setLiveOrders(data);
    });

    // 3. Fetch HISTORY ORDERS (Archive for the day)
    const fetchHistory = async () => {
      try {
        const qHist = query(
          collection(db, "order_history"),
          where("timestamp", ">=", Timestamp.fromDate(start)),
          where("timestamp", "<=", Timestamp.fromDate(end)),
          orderBy("timestamp", "desc")
        );
        const snapshot = await getDocs(qHist);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
        setHistoryOrders(data);
      } catch (e) {
        console.error("History fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    return () => unsubLive();
  }, [selectedDate]);

  // --- MERGED CALCULATIONS (Live + History) ---
  const allOrders = [...liveOrders, ...historyOrders];
  const totalRevenue = allOrders.reduce((sum, order) => sum + (Number(order.totalPrice) || 0), 0);
  const totalOrders = allOrders.length;
  const takeawayCount = allOrders.filter(o => o.tableId === 'Takeaway').length;
  const dineInCount = totalOrders - takeawayCount;
  const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(0) : 0;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* 0. DATE SELECTOR BAR */}
      <div className="bg-[#e76876] p-6 rounded-[2rem] border-4 border-zinc-900 shadow-[6px_6px_0_0_#000] flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="text-zinc-900" size={20} />
          <h3 className="font-black uppercase italic text-zinc-900">Analysis for:</h3>
        </div>
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-white border-4 border-zinc-900 rounded-xl px-4 py-2 font-black uppercase text-zinc-900 outline-none w-full md:w-auto"
        />
      </div>

      {/* 1. TOP METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={<Banknote size={24} />} color="bg-emerald-500" />
        <StatCard title="Total Orders" value={totalOrders} icon={<TrendingUp size={24} />} color="bg-zinc-900" />
        <StatCard title="Dine-In" value={dineInCount} icon={<Utensils size={24} />} color="bg-white" textColor="text-zinc-900" />
        <StatCard title="Take-Away" value={takeawayCount} icon={<ShoppingBag size={24} />} color="bg-zinc-900" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. RECENT TRANSACTIONS (Combined Feed) */}
        <div className="lg:col-span-2 bg-white border-4 border-zinc-900 rounded-[2.5rem] shadow-[8px_8px_0_0_#000] overflow-hidden">
          <div className="p-8 border-b-2 border-zinc-100 flex justify-between items-center bg-zinc-50">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-black">Day Transaction Log</h3>
            <div className="px-4 py-1 bg-zinc-900 text-[#e76876] rounded-full text-[10px] font-black uppercase tracking-widest">
              {loading ? "Syncing..." : "Updated"}
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 text-[10px] font-black uppercase text-zinc-400 border-b sticky top-0">
                <tr>
                  <th className="px-8 py-4 text-left">Status</th>
                  <th className="px-8 py-4 text-left">Source</th>
                  <th className="px-8 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {allOrders.length > 0 ? allOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-8 py-6">
                       <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                         order.status === 'Served' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                       }`}>
                         {order.status === 'Served' ? 'Archived' : 'Live'}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black uppercase italic text-zinc-900 leading-none">
                        {order.tableId === 'Takeaway' ? '🥡 Takeaway' : `🪑 Table ${order.tableId}`}
                      </p>
                      <p className="text-[10px] font-bold text-zinc-400 mt-1">#{order.orderNumber || '0000'}</p>
                    </td>
                    <td className="px-8 py-6 text-right font-black text-lg text-black">
                      {formatCurrency(order.totalPrice)}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="py-20 text-center text-zinc-300 font-black uppercase italic">No sales recorded for this date</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. PERFORMANCE INSIGHTS */}
        <div className="space-y-6">
          <div className="bg-zinc-900 text-white p-8 rounded-[2.5rem] border-4 border-zinc-900 shadow-[8px_8px_0_0_#e76876]">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#e76876] mb-2">Efficiency</p>
            <h3 className="text-3xl font-black uppercase italic leading-none mb-6">Store Health</h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold uppercase text-zinc-500 mb-1">Avg. Order Value</p>
                <p className="text-3xl font-black italic">{formatCurrency(averageOrderValue)}</p>
              </div>
              
              <div className="pt-6 border-t border-zinc-800">
                <p className="text-[10px] font-bold uppercase text-zinc-500 mb-3">Service Split</p>
                <div className="flex h-3 w-full rounded-full overflow-hidden bg-zinc-800">
                  <div className="bg-[#e76876]" style={{ width: `${(dineInCount / totalOrders) * 100}%` }} />
                  <div className="bg-emerald-500" style={{ width: `${(takeawayCount / totalOrders) * 100}%` }} />
                </div>
                <div className="flex justify-between mt-2 text-[9px] font-black uppercase">
                  <span className="text-[#e76876]">Dine-In ({dineInCount})</span>
                  <span className="text-emerald-500">Takeaway ({takeawayCount})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, textColor = "text-white" }: any) {
  return (
    <div className="bg-white border-4 border-zinc-900 p-6 rounded-[2.5rem] shadow-[6px_6px_0_0_#000] flex items-center gap-5">
      <div className={`${color} ${textColor} p-4 rounded-2xl border-2 border-zinc-900 shadow-sm`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest leading-none">{title}</p>
        <p className="text-2xl font-black italic text-black mt-1 leading-none">{value}</p>
      </div>
    </div>
  );
}
