// Cart Page - Displays all items in the shopping cart
// Allows quantity updates, item removal, and shows order summary in INR

import { Link } from "react-router-dom";
import { Trash2, ShoppingCart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartSubtotal, getCartItemCount } =
    useCart();
  const subtotal = getCartSubtotal();
  const itemCount = getCartItemCount();
  const shipping = subtotal > 499 ? 0 : 49;
  const tax = subtotal * 0.18;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-4 animate-page-in">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Cart items section */}
          <div className="lg:col-span-3 bg-card rounded-lg p-4 md:p-6">
            <div className="flex items-baseline justify-between mb-1">
              <h1 className="text-2xl font-bold text-foreground">Shopping Cart</h1>
              {cartItems.length > 0 && (
                <span className="text-sm text-muted-foreground">Price</span>
              )}
            </div>
            <hr className="border-border mb-4" />

            {cartItems.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingCart size={64} className="text-muted-foreground/40 mx-auto mb-4" />
                <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">
                  Add items to your cart to see them here.
                </p>
                <Link to="/" className="btn-amazon-primary inline-block">
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 pb-4 border-b border-border last:border-0"
                  >
                    {/* Product image */}
                    <Link to={`/product/${item.product.id}`} className="shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-24 h-24 sm:w-32 sm:h-32 object-contain bg-white rounded"
                      />
                    </Link>

                    {/* Product details */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product.id}`}>
                        <h3 className="text-sm sm:text-base amazon-link line-clamp-2">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p
                        className={`text-xs mt-1 font-medium ${
                          item.product.inStock
                            ? "text-amazon-teal"
                            : "text-amazon-deal"
                        }`}
                      >
                        {item.product.inStock ? "In Stock" : "Out of Stock"}
                      </p>
                      {item.product.isPrime && (
                        <span className="prime-badge text-xs mt-1 inline-block">
                          prime
                        </span>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Sold by: <span className="font-medium">{item.product.brand}</span>
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center border border-border rounded overflow-hidden">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            className="px-2.5 py-1 bg-secondary hover:bg-muted text-sm font-bold transition-colors"
                          >
                            −
                          </button>
                          <span className="px-3 py-1 text-sm bg-card border-x border-border min-w-[40px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            className="px-2.5 py-1 bg-secondary hover:bg-muted text-sm font-bold transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-muted-foreground text-sm">|</span>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-amazon-link text-sm hover:underline flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <span className="font-bold text-foreground">
                        ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                      {item.quantity > 1 && (
                        <p className="text-xs text-muted-foreground">
                          ₹{item.product.price.toLocaleString("en-IN")} each
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cartItems.length > 0 && (
              <div className="text-right mt-4 text-base">
                Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""}):
                <span className="font-bold ml-2">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          {cartItems.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg p-4 sticky top-32">
                {subtotal > 499 && (
                  <p className="text-sm text-amazon-teal mb-3">
                    ✓ Your order qualifies for{" "}
                    <span className="font-bold">FREE Delivery</span>
                  </p>
                )}
                <div className="space-y-1.5 text-sm mb-4">
                  <div className="flex justify-between">
                    <span>Items ({itemCount}):</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery:</span>
                    <span className={shipping === 0 ? "text-amazon-teal font-medium" : ""}>
                      {shipping === 0 ? "FREE" : `₹${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>GST (18%):</span>
                    <span>₹{Math.round(tax).toLocaleString("en-IN")}</span>
                  </div>
                  <hr className="border-border" />
                  <div className="flex justify-between font-bold text-base">
                    <span>Order Total:</span>
                    <span>₹{Math.round(subtotal + shipping + tax).toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  className="btn-amazon-primary block text-center w-full"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
