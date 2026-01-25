"use client"

import { useState, useEffect } from 'react';
import { db } from '@/firebase/config';
import { collection, onSnapshot, updateDoc, doc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { uploadMenuImage } from '@/lib/upload-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Camera, Loader2, Image as ImageIcon, Plus } from 'lucide-react';

export default function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // 1. Fetch live data
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "menu_items"), (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as MenuItem)));
    });
    return () => unsubscribe();
  }, []);

  // 2. Toggle Sold Out Status
  const toggleStatus = async (item: MenuItem) => {
    const itemRef = doc(db, "menu_items", item.id);
    await updateDoc(itemRef, { available: !item.available });
  };

  // 3. Handle Add Item
  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      let imageUrl = "";
      if (file) {
        imageUrl = await uploadMenuImage(file) || "";
      }

      await addDoc(collection(db, "menu_items"), {
        name: formData.get("name"),
        price: Number(formData.get("price")),
        category: formData.get("category"),
        description: formData.get("description"),
        image: imageUrl,
        available: true,
        timestamp: serverTimestamp()
      });
      
      setFile(null);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error("Error adding item:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 p-2">
      {/* ADD ITEM FORM */}
      <section className="bg-white border-4 border-zinc-900 p-6 rounded-[2rem] shadow-[8px_8px_0_0_#000]">
        <h2 className="text-xl font-black uppercase italic mb-6 flex items-center gap-2">
          <Plus className="w-6 h-6" /> Add New Dish
        </h2>
        <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <Input name="name" placeholder="Dish Name" required className="border-2 border-zinc-900 rounded-xl" />
          <Input name="price" type="number" placeholder="Price (₹)" required className="border-2 border-zinc-900 rounded-xl" />
          <Input name="category" placeholder="Category" required className="border-2 border-zinc-900 rounded-xl" />
          
          <div className="relative">
            <label className="flex items-center justify-center w-full h-10 border-2 border-dashed border-zinc-300 rounded-xl cursor-pointer hover:bg-zinc-50 transition-all">
              <Camera className="w-4 h-4 mr-2" />
              <span className="text-[10px] font-bold uppercase">{file ? "Image Ready" : "Upload Photo"}</span>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          <Button disabled={isUploading} className="bg-zinc-900 text-white font-black uppercase italic h-10 rounded-xl">
            {isUploading ? <Loader2 className="animate-spin" /> : "Save to Cloud"}
          </Button>
        </form>
      </section>

      {/* LIVE LIST */}
      <div className="bg-white border-4 border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
            <tr>
              <th className="p-6">Dish</th>
              <th className="p-6">Price</th>
              <th className="p-6">Stock Status</th>
              <th className="p-6 text-right">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-zinc-100">
            {items.map((item) => (
              <tr key={item.id} className={`group transition-opacity ${!item.available ? "bg-zinc-50 opacity-60" : ""}`}>
                <td className="p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 border-2 border-zinc-900 overflow-hidden shrink-0 shadow-sm">
                    {item.image ? (
                      <img src={item.image} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300"><ImageIcon /></div>
                    )}
                  </div>
                  <div>
                    <p className="font-black text-zinc-900 uppercase italic">{item.name}</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">{item.category}</p>
                  </div>
                </td>
                <td className="p-4 font-black text-lg">₹{item.price}</td>
                <td className="p-4">
                  <button 
                    onClick={() => toggleStatus(item)}
                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all border-2 ${
                      item.available 
                      ? "bg-emerald-50 border-emerald-500 text-emerald-600" 
                      : "bg-rose-50 border-rose-500 text-rose-600"
                    }`}
                  >
                    {item.available ? "In Stock" : "Sold Out"}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={async () => { if(confirm("Delete item?")) await deleteDoc(doc(db, "menu_items", item.id)) }}
                    className="p-3 text-zinc-300 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}