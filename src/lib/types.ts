export interface MenuItem {
  id: string; // Changed from number to string for Firestore compatibility
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;      // This will store the Firebase Storage URL
  available: boolean;  // NEW: To track stock status
  imageHint?: string; // Made optional as it's less critical with real photos
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  tableId: string;
  items: CartItem[];
  totalPrice: number;
  status: 'Received' | 'Preparing' | 'Served' | 'Completed';
  timestamp: any; // Using 'any' or 'Timestamp' to handle Firestore Server Timestamps
}