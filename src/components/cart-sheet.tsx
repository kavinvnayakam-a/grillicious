"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, Loader2, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc, runTransaction } from "firebase/firestore";

type CartSheetProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  tableId: string | null;
};

export function CartSheet({ isOpen, onOpenChange, tableId }: CartSheetProps) {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const firestore = useFirestore();

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0 || !firestore) return;
    setIsPlacingOrder(true);

    try {
      // 1. Get Today's Date String for the counter reset
      const today = new Date().toISOString().split('T')[0]; 
      const counterRef = doc(firestore, "daily_stats", today);

      // 2. Run Transaction to get the next sequential Order Number (0001 - 1000)
      const orderNumber = await runTransaction(firestore, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        let newCount = 1;

        if (counterDoc.exists()) {
          newCount = counterDoc.data().count + 1;
          // Loop back to 1 if it exceeds 1000
          if (newCount > 1000) newCount = 1;
        }

        transaction.set(counterRef, { count: newCount }, { merge: true });
        return newCount.toString().padStart(4, '0'); // Formats to "0001"
      });

      // 3. Prepare Order Data
      const orderData = {
        orderNumber, // Sequential Number e.g. "0042"
        tableId: tableId || "Takeaway",
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        totalPrice: cartTotal,
        status: 'Pending',
        timestamp: serverTimestamp(),
        createdAt: Date.now(),
      };

      // 4. Push to Firebase
      const docRef = await addDoc(collection(firestore, "orders"), orderData);

      toast({
        title: `Order #${orderNumber} Sent! 🚀`,
        description: "Waiting for kitchen approval...",
        className: "bg-zinc-900 text-white border-b-4 border-[#e76876]",
      });

      clearCart();
      onOpenChange(false);
      router.push(`/order-status/${docRef.id}`);

    } catch (error) {
      console.error("Order Error:", error);
      toast({
        title: "Order Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="flex flex-col bg-zinc-900 border-l-4 border-[#e76876] text-white w-[85vw] sm:max-w-md p-0 overflow-hidden"
      >
        <SheetHeader className="p-6 border-b border-zinc-800">
          <SheetTitle className="text-xl font-black uppercase italic tracking-tighter text-white flex items-center gap-2">
            <ShoppingBag className="text-[#e76876] h-5 w-5" /> 
            {tableId ? `Table ${tableId}` : 'Takeaway Order'}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-30 space-y-4">
              <ShoppingBag size={40} />
              <p className="text-center font-bold uppercase tracking-widest text-[10px]">Your cart is empty</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-5 animate-in fade-in slide-in-from-right-4">
                  <div className="relative h-14 w-14 shrink-0">
                    {item.image ? (
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill 
                        className="rounded-lg object-cover border border-zinc-700 shadow-lg"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800">
                        <ImageIcon className="h-6 w-6 text-zinc-500" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-black uppercase italic tracking-tight text-xs truncate leading-none mb-1">
                      {item.name}
                    </p>
                    <p className="text-[#e76876] font-bold text-xs">
                      {formatCurrency(item.price)}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center bg-zinc-800 rounded-lg border border-zinc-700 p-0.5">
                        <button 
                          className="p-1 hover:text-[#e76876] transition-colors"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3"/>
                        </button>
                        <span className="w-6 text-center font-bold text-[10px] tabular-nums">{item.quantity}</span>
                        <button 
                          className="p-1 hover:text-[#e76876] transition-colors"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3"/>
                        </button>
                      </div>
                    </div>
                  </div>

                  <button 
                    className="p-2 text-zinc-600 hover:text-rose-500 transition-colors"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4"/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <SheetFooter className="bg-zinc-800/50 p-6 mt-auto border-t border-zinc-800 backdrop-blur-sm">
            <div className="w-full space-y-4">
              <div className="flex justify-between items-end px-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Total</span>
                <div className="text-4xl font-black text-[#e76876] tracking-tighter tabular-nums">
                  {formatCurrency(cartTotal)}
                </div>
              </div>
              
              <Button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full h-16 text-base font-black uppercase italic tracking-widest bg-[#e76876] text-zinc-900 hover:bg-white rounded-2xl shadow-[0_8px_0_0_#c44a59] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-3"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="animate-spin" /> Sending...
                  </>
                ) : (
                  "Confirm Order"
                )}
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
