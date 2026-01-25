import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
  projectId: "grillicious-backend",
  appId: "1:298907118316:web:9ae9bb6c11b5f91fc553c9",
  apiKey: "AIzaSyDq3uj_iKP3BON4btk5k6FnvhZwpKqmdiE",
  authDomain: "grillicious-backend.firebaseapp.com",
  measurementId: "G-KSEY1B1TMT",
  messagingSenderId: "298907118316",
  // Adding the standard storage bucket URL based on your project ID
  storageBucket: "grillicious-backend.firebasestorage.app" 
};

// Initialize Firebase (Singleton pattern to prevent multiple instances)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize and EXPORT the services
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;