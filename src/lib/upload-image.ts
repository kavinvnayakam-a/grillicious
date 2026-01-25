import { storage } from "@/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Uploads an image to Firebase Storage and returns the public URL.
 * @param file The image file from an input element
 * @param folder The subfolder in storage (defaults to 'menu')
 */
export async function uploadMenuImage(file: File, folder: string = "menu-items") {
  if (!file) return null;

  try {
    // 1. Create a unique filename to prevent overwriting
    // Format: menu-items/1700000000-burger.jpg
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const storagePath = `${folder}/${timestamp}-${cleanFileName}`;
    
    const storageRef = ref(storage, storagePath);

    // 2. Upload the file
    const snapshot = await uploadBytes(storageRef, file);

    // 3. Get and return the public URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error("Firebase Storage Upload Error:", error);
    throw new Error("Failed to upload image. Please check your connection.");
  }
}