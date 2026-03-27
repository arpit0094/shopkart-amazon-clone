// Cart Context - Global state management for shopping cart + wishlist
// Uses localStorage for persistence across page reloads

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem, Product, Order, ShippingAddress, OrderStatus } from "@/types";
import { toast } from "@/hooks/use-toast";
import { placeOrderAPI } from "@/lib/api";


interface CartContextType {
  cartItems: CartItem[];
  orders: Order[];
  wishlistItems: Product[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartSubtotal: () => number;
  getCartItemCount: () => number;
  placeOrder: (address: ShippingAddress) => Order;
  placeOrderAsync: (address: ShippingAddress, userEmail?: string, userId?: string) => Promise<Order>;

  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  moveToCart: (product: Product) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Load cart from localStorage on init
const loadCart = (): CartItem[] => {
  try {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Load orders from localStorage
const loadOrders = (): Order[] => {
  try {
    const saved = localStorage.getItem("orders");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Load wishlist from localStorage
const loadWishlist = (): Product[] => {
  try {
    const saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(loadCart);
  const [orders, setOrders] = useState<Order[]>(loadOrders);
  const [wishlistItems, setWishlistItems] = useState<Product[]>(loadWishlist);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Persist orders to localStorage
  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  // Persist wishlist to localStorage
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  // Add a product to cart or increase quantity if already present
  const addToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    toast({
      title: "Added to Cart",
      description: `${product.name.slice(0, 50)}... added to your cart.`,
    });
  };

  // Remove a product from cart entirely
  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Update quantity for a specific product
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Clear all items from cart
  const clearCart = () => setCartItems([]);

  // Calculate subtotal (before tax/shipping) — INR values
  const getCartSubtotal = () =>
    cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Calculate total including estimated tax and shipping — INR
  const getCartTotal = () => {
    const subtotal = getCartSubtotal();
    const tax = subtotal * 0.18; // 18% GST
    const shipping = subtotal > 499 ? 0 : 49; // Free shipping above ₹499
    return subtotal + tax + shipping;
  };

  // Get total number of items in cart
  const getCartItemCount = () =>
    cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Place an order - creates order record and clears cart (synchronous / localStorage fallback)
  const placeOrder = (address: ShippingAddress): Order => {
    const subtotal = getCartSubtotal();
    const shipping = subtotal > 499 ? 0 : 49;
    const tax = subtotal * 0.18;

    const order: Order = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      items: [...cartItems],
      shippingAddress: address,
      subtotal,
      shipping,
      tax,
      total: subtotal + shipping + tax,
      placedAt: new Date().toISOString(),
      status: "Confirmed",
    };

    setOrders((prev) => [order, ...prev]);
    clearCart();
    return order;
  };

  // Place an order — tries backend API first, falls back to localStorage
  const placeOrderAsync = async (
    address: ShippingAddress,
    userEmail = "arpit@shopkart.in",
    userId = "user-001"
  ): Promise<Order> => {
    const subtotal = getCartSubtotal();
    const shipping = subtotal > 499 ? 0 : 49;
    const tax = subtotal * 0.18;
    const total = subtotal + shipping + tax;

    try {
      // Try the real backend
      const result = await placeOrderAPI({
        userId,
        userEmail,
        items: cartItems,
        shippingAddress: address,
        subtotal,
        shipping,
        tax,
        total,
      });

      // Map backend response to frontend Order type
      const order: Order = {
        id: result.order.id,
        items: cartItems,
        shippingAddress: address,
        subtotal,
        shipping,
        tax,
        total,
        placedAt: result.order.placed_at || new Date().toISOString(),
        status: "Confirmed",
      };

      setOrders((prev) => [order, ...prev]);
      clearCart();
      return order;
    } catch (err) {
      // Backend unavailable — silently fall back to localStorage
      console.warn("Backend unavailable, using localStorage:", err);
      return placeOrder(address);
    }
  };


  // Add product to wishlist
  const addToWishlist = (product: Product) => {
    setWishlistItems((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
    toast({ title: "Added to Wishlist", description: product.name.slice(0, 50) });
  };

  // Remove product from wishlist
  const removeFromWishlist = (productId: string) => {
    setWishlistItems((prev) => prev.filter((p) => p.id !== productId));
  };

  // Check if product is in wishlist
  const isInWishlist = (productId: string) =>
    wishlistItems.some((p) => p.id === productId);

  // Move product from wishlist to cart
  const moveToCart = (product: Product) => {
    addToCart(product);
    removeFromWishlist(product.id);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        orders,
        wishlistItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartSubtotal,
        getCartItemCount,
        placeOrder,
        placeOrderAsync,

        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        moveToCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook for accessing cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
