// Order Confirmation Page - Shows success message and order details
// Displayed after a successful order placement

import { Link, useParams } from "react-router-dom";
import { CheckCircle, Package } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { orders } = useCart();
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <Link to="/" className="amazon-link">
            Back to Shopping
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 max-w-3xl animate-page-in">
        {/* Success banner */}
        <div className="bg-card rounded-lg p-6 md:p-8 text-center mb-6">
          <CheckCircle size={64} className="text-amazon-teal mx-auto mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Order Placed Successfully! 🎉
          </h1>
          <p className="text-muted-foreground mb-3">
            Thank you for shopping with <strong>ShopKart</strong>. Your order
            has been confirmed.
          </p>
          <div className="inline-block bg-secondary rounded-lg px-4 py-2">
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="font-bold text-amazon-orange text-lg">{order.id}</p>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Estimated delivery:{" "}
            <span className="font-medium text-foreground">
              {new Date(
                new Date(order.placedAt).getTime() + 3 * 24 * 60 * 60 * 1000
              ).toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
          </p>
        </div>

        {/* Order details card */}
        <div className="bg-card rounded-lg p-4 md:p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Order Details</h2>

          {/* Shipping address */}
          <div className="mb-4 p-3 bg-secondary rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Package size={16} className="text-muted-foreground" />
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                Shipping To
              </h3>
            </div>
            <p className="text-sm font-medium">{order.shippingAddress.fullName}</p>
            <p className="text-sm text-muted-foreground">
              {order.shippingAddress.addressLine1}
            </p>
            {order.shippingAddress.addressLine2 && (
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.addressLine2}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {order.shippingAddress.city}, {order.shippingAddress.state} —{" "}
              {order.shippingAddress.zipCode}
            </p>
            <p className="text-sm text-muted-foreground">
              📱 {order.shippingAddress.phone}
            </p>
          </div>

          <hr className="border-border mb-4" />

          {/* Items ordered */}
          <h3 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wide">
            Items Ordered
          </h3>
          <div className="space-y-3 mb-4">
            {order.items.map((item) => (
              <div key={item.product.id} className="flex gap-3">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-16 h-16 object-contain shrink-0 bg-white rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  <p className="text-xs text-muted-foreground">by {item.product.brand}</p>
                </div>
                <span className="font-medium text-sm shrink-0">
                  ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>

          <hr className="border-border mb-4" />

          {/* Price breakdown */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery:</span>
              <span className={order.shipping === 0 ? "text-amazon-teal font-medium" : ""}>
                {order.shipping === 0 ? "FREE" : `₹${order.shipping}`}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>GST (18%):</span>
              <span>₹{Math.round(order.tax).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-base font-bold mt-2 pt-2 border-t border-border">
              <span>Total Paid:</span>
              <span>₹{Math.round(order.total).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/orders" className="btn-amazon-outline text-center">
            View Your Orders
          </Link>
          <Link to="/" className="btn-amazon-primary text-center">
            Continue Shopping
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
