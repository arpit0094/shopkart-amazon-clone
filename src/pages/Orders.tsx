// Orders Page - Displays order history with status timeline
// Shows all past orders with their status and details

import { Link } from "react-router-dom";
import { Package, CheckCircle, Truck, Box, ClipboardList } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { OrderStatus } from "@/types";

const STATUS_STEPS: OrderStatus[] = ["Confirmed", "Processing", "Shipped", "Delivered"];

const STATUS_ICONS: Record<OrderStatus, React.ReactNode> = {
  Confirmed: <ClipboardList size={14} />,
  Processing: <Box size={14} />,
  Shipped: <Truck size={14} />,
  Delivered: <CheckCircle size={14} />,
};

const Orders = () => {
  const { orders } = useCart();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-4 max-w-4xl animate-page-in">
        <h1 className="text-2xl font-bold text-foreground mb-6">Your Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-card rounded-lg p-8 text-center">
            <Package size={64} className="text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="text-xl font-medium mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-4">
              When you place orders, they will appear here.
            </p>
            <Link to="/" className="btn-amazon-primary inline-block">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const currentStepIdx = STATUS_STEPS.indexOf(order.status);

              return (
                <div
                  key={order.id}
                  className="bg-card rounded-lg overflow-hidden border border-border"
                >
                  {/* Order header */}
                  <div className="bg-secondary px-4 py-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs uppercase tracking-wide">
                        Order Placed
                      </span>
                      <p className="font-medium">
                        {new Date(order.placedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs uppercase tracking-wide">
                        Total
                      </span>
                      <p className="font-medium">
                        ₹{Math.round(order.total).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs uppercase tracking-wide">
                        Ship To
                      </span>
                      <p className="font-medium">{order.shippingAddress.fullName}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <span className="text-muted-foreground text-xs uppercase tracking-wide">
                        Order #
                      </span>
                      <p className="font-medium text-amazon-link">{order.id}</p>
                    </div>
                  </div>

                  <div className="p-4">
                    {/* Status timeline */}
                    <div className="flex items-center mb-4 overflow-x-auto scrollbar-hide">
                      {STATUS_STEPS.map((step, i) => {
                        const done = i <= currentStepIdx;
                        const active = i === currentStepIdx;
                        return (
                          <div key={step} className="flex items-center flex-1 min-w-0">
                            <div className="flex flex-col items-center shrink-0">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                  done
                                    ? "bg-amazon-teal text-white"
                                    : "bg-secondary border-2 border-border text-muted-foreground"
                                } ${active ? "ring-2 ring-amazon-orange ring-offset-1" : ""}`}
                              >
                                {STATUS_ICONS[step]}
                              </div>
                              <span
                                className={`text-xs mt-1 whitespace-nowrap ${
                                  done ? "text-amazon-teal font-semibold" : "text-muted-foreground"
                                }`}
                              >
                                {step}
                              </span>
                            </div>
                            {i < STATUS_STEPS.length - 1 && (
                              <div
                                className={`flex-1 h-1 mx-1 rounded ${
                                  i < currentStepIdx ? "bg-amazon-teal" : "bg-border"
                                }`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.product.id} className="flex gap-3">
                          <Link to={`/product/${item.product.id}`}>
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-20 h-20 object-contain shrink-0 bg-white rounded"
                            />
                          </Link>
                          <div>
                            <Link to={`/product/${item.product.id}`}>
                              <p className="text-sm amazon-link line-clamp-1">
                                {item.product.name}
                              </p>
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                            <p className="text-sm font-medium">
                              ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                            </p>
                            <Link
                              to={`/product/${item.product.id}`}
                              className="btn-amazon-primary text-xs px-3 py-1 mt-2 inline-block"
                            >
                              Buy again
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
