// Type definitions for the e-commerce application

// Represents a single product in the catalog
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // For showing discounts
  images: string[];
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  specifications: Record<string, string>;
  brand: string;
  isPrime?: boolean; // Prime eligible
}

// Represents an item in the shopping cart
export interface CartItem {
  product: Product;
  quantity: number;
}

// Shipping address for order placement
export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

// Order status progression
export type OrderStatus = "Confirmed" | "Processing" | "Shipped" | "Delivered";

// Represents a placed order
export interface Order {
  id: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  placedAt: string;
  status: OrderStatus;
}

// Represents an authenticated user
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}
