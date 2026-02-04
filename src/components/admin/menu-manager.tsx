"use client"

import { useState, useEffect } from 'react';
import { useFirestore, useStorage } from '@/firebase';
import { collection, onSnapshot, updateDoc, doc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { uploadMenuImage } from '@/lib/upload-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Camera, Loader2, Image as ImageIcon, Plus, X, RefreshCw } from 'lucide-react';
import { MenuItem } from '@/lib/types';

export default function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const firestore = useFirestore();
  const storage = useStorage();

  useEffect(() => {
    if (!firestore) return;
    const unsubscribe = onSnapshot(collection(firestore, "menu_items"), (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as MenuItem)));
    });
    return () => unsubscribe();
  }, [firestore]);

  const toggleStatus = async (item: MenuItem) => {
    if (!firestore) return;
    const itemRef = doc(firestore, "menu_items", item.id);
    await updateDoc(itemRef, { available: !item.available });
  };

  const handleRemoveImage = async (itemId: string) => {
    if (!firestore) return;
    if (!confirm("Remove this image? The item will stay on the menu.")) return;
    try {
      const itemRef = doc(firestore, "menu_items", itemId);
      await updateDoc(itemRef, { image: "" });
    } catch (err) {
      console.error("Error removing image:", err);
    }
  };

  const handleUpdateImage = async (itemId: string, newFile: File) => {
    if (!firestore || !storage) return;
    setIsUploading(true);
    try {
      const imageUrl = await uploadMenuImage(storage, newFile);
      if (imageUrl) {
        const itemRef = doc(firestore, "menu_items", itemId);
        await updateDoc(itemRef, { image: imageUrl });
      }
    } catch (err) {
      console.error("Error updating image:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore || !storage) return;
    setIsUploading(true);
    const formData = new FormData(e.currentTarget);
    try {
      let imageUrl = "";
      if (file) {
        imageUrl = await uploadMenuImage(storage, file) || "";
      }
      await addDoc(collection(firestore, "menu_items"), {
        name: formData.get("name"),
        price: Number(formData.get("price")),
        category: formData.get("category"),
        description: "",
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
              <span className="text-[10px] font-bold uppercase">{file ? "Ready" : "Upload Photo"}</span>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          <Button disabled={isUploading} className="bg-zinc-900 text-white hover:bg-[#e76876] hover:text-zinc-900 font-black uppercase italic h-10 rounded-xl">
            {isUploading ? <Loader2 className="animate-spin" /> : "Save to Cloud"}
          </Button>
        </form>
      </section>

      {/* LIVE LIST */}
      <div className="bg-white border-4 border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
            <tr>
              <th className="p-6">Dish & Image</th>
              <th className="p-6">Price</th>
              <th className="p-6">Stock Status</th>
              <th className="p-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-zinc-100">
            {items.map((item) => (
              <tr key={item.id} className={`group transition-opacity ${!item.available ? "bg-zinc-50 opacity-60" : ""}`}>
                <td className="p-4 flex items-center gap-4">
                  {/* Image Container */}
                  <div className="relative w-20 h-20 shrink-0">
                    <div className="w-full h-full rounded-2xl bg-zinc-100 border-2 border-zinc-900 overflow-hidden shadow-sm relative">
                      {item.image ? (
                        <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300">
                          <ImageIcon size={24} />
                        </div>
                      )}

                      {/* Upload/Swap Overlay (Clicking this triggers file input) */}
                      <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 hover:opacity-100 cursor-pointer transition-opacity z-10">
                        <RefreshCw size={20} className={isUploading ? "animate-spin" : ""} />
                        <span className="text-[8px] font-bold uppercase mt-1">Swap</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={(e) => {
                            const newFile = e.target.files?.[0];
                            if (newFile) handleUpdateImage(item.id, newFile);
                          }} 
                        />
                      </label>
                    </div>

                    {/* RED X BUTTON (Outside the label, high z-index) */}
                    {item.image && (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveImage(item.id);
                        }}
                        className="absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-full border-2 border-white shadow-lg hover:scale-110 active:scale-90 transition-all z-20"
                        title="Remove Image Only"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    )}
                  </div>

                  <div>
                    <p className="font-black text-zinc-900 uppercase italic leading-tight">{item.name}</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.category}</p>
                    {item.image && (
                      <button 
                        onClick={() => handleRemoveImage(item.id)}
                        className="text-[9px] text-rose-500 font-bold uppercase mt-1 hover:underline"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </td>

                <td className="p-4 font-black text-lg text-zinc-900">₹{item.price}</td>
                
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
                    onClick={async () => { if(confirm("Delete item permanently?")) { if (firestore) await deleteDoc(doc(firestore, "menu_items", item.id)) } }}
                    className="p-3 bg-zinc-50 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
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
