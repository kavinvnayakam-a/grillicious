"use client"

import { collection, writeBatch, doc, Firestore } from "firebase/firestore";
import { menuItems } from "./menu-data"; // Your local data file

export const pushLocalMenuToFirestore = async (db: Firestore) => {
  try {
    const batch = writeBatch(db);
    const menuCollection = collection(db, "menu_items");

    menuItems.forEach((item) => {
      // We use the local ID as the Document ID to prevent duplicates
      const docRef = doc(menuCollection, item.id.toString());
      
      batch.set(docRef, {
        name: item.name,
        description: item.description,
        price: Number(item.price),
        category: item.category,
        image: item.image,
        available: true,
        lastUpdated: new Date()
      });
    });

    await batch.commit();
    return { success: true, count: menuItems.length };
  } catch (error: any) {
    console.error("Firestore Sync Error:", error);
    return { success: false, error: error.message };
  }
};
