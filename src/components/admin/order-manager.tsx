"use client"

import { useState, useEffect } from 'react';
import { db } from '@/firebase/config';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Order } from '@/lib/types';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Trash2, 
  ChefHat,
  Timer
} from 'lucide-react';

export default function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  // 1. Listen for ALL active orders
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
    });
    return () => unsubscribe();
  }, []);

  // 2. Group orders by Table ID
  const tableMap = orders.reduce((acc, order) => {
    if (!acc[order.tableId]) acc[order.tableId] = [];
    acc[order.tableId].push(order);
    return acc;
  }, {} as Record<string, Order[]>);

  // 3. Status Update Logic
  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    await updateDoc(doc(db, "orders", orderId), { status: newStatus });
  };

  const clearTable = async (tableId: string) => {
    if (!confirm(`Clear all orders for Table ${tableId}?`)) return;
    const tableOrders = tableMap[tableId];
    for (const order of tableOrders) {
      await deleteDoc(doc(db, "orders", order.id));
    }
    setSelectedTable(null);
  };

  // Define your total tables (e.g., 1 to 12)
  const allTables = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* LEFT: TABLE GRID (Floor Plan) */}
      <div className="lg:col-span-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {allTables.map((tId) => {
          const hasOrders = !!tableMap[tId];
          const isActive = selectedTable === tId;
          
          return (
            <button
              key={tId}
              onClick={() => setSelectedTable(tId)}
              className={`relative p-6 rounded-[2rem] border-4 transition-all flex flex-col items-center justify-center gap-2 ${
                hasOrders 
                ? "bg-zinc-900 border-[#d4af37] text-white shadow-[8px_8px_0_0_#d4af37]" 
                : "bg-white border-zinc-200 text-zinc-400 hover:border-zinc-900"
              } ${isActive ? "scale-105" : ""}`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest">Table</span>
              <span className="text-4xl font-black italic">{tId}</span>
              {hasOrders && (
                <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-zinc-900">
                  {tableMap[tId].length}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* RIGHT: ORDER DETAILS */}
      <div className="lg:col-span-2">
        {selectedTable ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center bg-zinc-900 p-6 rounded-[2rem] border-b-4 border-[#d4af37] text-white">
              <div>
                <h3 className="text-3xl font-black uppercase italic">Table {selectedTable}</h3>
                <p className="text-[10px] font-bold text-[#d4af37] uppercase tracking-widest">Active Orders</p>
              </div>
              <button 
                onClick={() => clearTable(selectedTable)}
                className="bg-rose-500/20 hover:bg-rose-500 text-rose-500 hover:text-white p-3 rounded-2xl transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {tableMap[selectedTable]?.map((order) => (
                <div key={order.id} className="bg-white border-4 border-zinc-900 p-6 rounded-[2.5rem] shadow-xl">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-zinc-100 rounded-2xl"><Clock className="w-5 h-5" /></div>
                      <div>
                        <p className="text-xs font-black uppercase text-zinc-400">Time</p>
                        <p className="font-bold">{new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    
                    <select 
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                      className={`font-black uppercase italic text-xs px-4 py-2 rounded-xl border-2 transition-all ${
                        order.status === 'Preparing' ? 'bg-amber-50 border-amber-500 text-amber-600' :
                        order.status === 'Served' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' :
                        'bg-zinc-100 border-zinc-900 text-zinc-900'
                      }`}
                    >
                      <option value="Received">Received</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Served">Served</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div className="space-y-3 mb-6">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-zinc-50 p-3 rounded-xl border-2 border-zinc-100">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 flex items-center justify-center bg-zinc-900 text-[#d4af37] text-[10px] font-black rounded-lg">
                            {item.quantity}
                          </span>
                          <span className="font-black uppercase italic text-sm">{item.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t-2 border-zinc-100 flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-zinc-400">Total</span>
                    <span className="text-2xl font-black italic">₹{order.totalPrice}</span>
                  </div>
                </div>
              ))}
              {!tableMap[selectedTable] && (
                <div className="text-center py-20 bg-zinc-100 rounded-[2.5rem] border-4 border-dashed border-zinc-200">
                  <ChefHat className="w-12 h-12 mx-auto text-zinc-300 mb-4" />
                  <p className="font-black uppercase italic text-zinc-400">No active orders here</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white border-4 border-dashed border-zinc-200 rounded-[3rem]">
            <div className="p-8 bg-zinc-50 rounded-full mb-6">
              <Users className="w-12 h-12 text-zinc-300" />
            </div>
            <h3 className="text-2xl font-black uppercase italic text-zinc-300">Select a Table</h3>
            <p className="text-zinc-400 font-bold text-xs uppercase tracking-widest mt-2">To view live orders</p>
          </div>
        )}
      </div>
    </div>
  );
}