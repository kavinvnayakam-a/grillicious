"use client"

import { useState } from "react";
import { collection } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { useFirestore } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function AddItemForm() {
  const firestore = useFirestore();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Wraps",
    description: "",
    image: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) {
      alert("Error: Firestore is not initialized.");
      return;
    }
    try {
      const menuCollection = collection(firestore, "menu_items");
      addDocumentNonBlocking(menuCollection, {
        ...formData,
        price: Number(formData.price),
        createdAt: new Date(),
        available: true
      });
      alert("Item added successfully!");
      setFormData({ name: "", price: "", category: "Wraps", description: "", image: "" });
    } catch (err) {
      console.error("Error adding item:", err);
      alert("Error adding item. See console for details.");
    }
  };

  return (
    <Card className="border-4 border-zinc-900 shadow-[8px_8px_0px_0px_#18181b] rounded-[2rem]">
      <CardHeader>
        <CardTitle className="text-xl font-black uppercase italic tracking-tighter">Add New Dish</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            placeholder="Dish Name (e.g. Classic Shawarma)" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="border-2 border-zinc-900 rounded-xl font-bold"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              type="number" 
              placeholder="Price (₹)" 
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="border-2 border-zinc-900 rounded-xl font-bold"
            />
            <select 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="border-2 border-zinc-900 rounded-xl font-bold px-3 bg-white"
            >
              <option>Wraps</option>
              <option>Shawarma</option>
              <option>Drinks</option>
              {/* Add all your categories here */}
            </select>
          </div>
          <Button className="w-full bg-zinc-900 hover:bg-[#d4af37] hover:text-zinc-900 text-white font-black uppercase tracking-widest py-6 rounded-xl transition-all">
            <PlusCircle className="mr-2" /> Add to Menu
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
