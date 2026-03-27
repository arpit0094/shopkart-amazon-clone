/**
 * api.ts — Frontend API client for the ShopKart backend
 *
 * ── API BASE URL ──────────────────────────────────────────────
 * Local dev:   http://localhost:3001/api  (Express running locally)
 * Production:  Set VITE_API_URL on Netlify dashboard to your Render URL
 *              e.g. https://shopkart-backend.onrender.com/api
 *
 * All API calls go through this module for easy maintenance.
 * Falls back gracefully to localStorage if server is unavailable.
 */

// VITE_API_URL is injected at build time from Netlify environment variables
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";


// Generic fetch wrapper with error handling
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export const getProducts = (params?: { search?: string; category?: string }) => {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.category && params.category !== "All") query.set("category", params.category);
  const qs = query.toString();
  return apiFetch<any[]>(`/products${qs ? "?" + qs : ""}`);
};

export const getProduct = (id: string) => apiFetch<any>(`/products/${id}`);

export const getCategories = () => apiFetch<string[]>("/products/categories");

// ─── Orders ──────────────────────────────────────────────────────────────────

export interface PlaceOrderPayload {
  userId: string;
  userEmail: string;
  items: Array<{ product: any; quantity: number }>;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export const placeOrderAPI = (payload: PlaceOrderPayload) =>
  apiFetch<{ success: boolean; order: any; message: string; emailPreviewUrl: string | null }>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getOrders = (userId: string) =>
  apiFetch<any[]>(`/orders?userId=${encodeURIComponent(userId)}`);

export const getOrder = (orderId: string) => apiFetch<any>(`/orders/${orderId}`);

// ─── Health ───────────────────────────────────────────────────────────────────

export const checkHealth = () =>
  apiFetch<{ status: string; message: string }>("/health");
