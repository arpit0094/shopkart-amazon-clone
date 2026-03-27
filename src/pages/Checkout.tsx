// Checkout Page - Order placement with shipping address form
// Shows reviewing items and complete order summary in INR

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ShippingAddress } from "@/types";

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getCartSubtotal, placeOrderAsync } = useCart();

  const { user } = useAuth();
  const subtotal = getCartSubtotal();
  const shipping = subtotal > 499 ? 0 : 49;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  const [address, setAddress] = useState<ShippingAddress>({
    fullName: user?.name ?? "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});
  const [placing, setPlacing] = useState(false);

  const handleChange = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingAddress, string>> = {};
    if (!address.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!address.addressLine1.trim()) newErrors.addressLine1 = "Address is required";
    if (!address.city.trim()) newErrors.city = "City is required";
    if (!address.state.trim()) newErrors.state = "State is required";
    if (!address.zipCode.trim()) newErrors.zipCode = "PIN code is required";
    if (!address.phone.trim()) newErrors.phone = "Mobile number is required";
    else if (!/^\+?[\d\s-]{10,}$/.test(address.phone))
      newErrors.phone = "Enter a valid phone number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    setPlacing(true);
    try {
      // placeOrderAsync tries the backend API first (sends email), falls back to localStorage
      const order = await placeOrderAsync(
        address,
        user?.email ?? "customer@shopkart.in",
        user?.id ?? "guest-user"
      );
      navigate(`/order-confirmation/${order.id}`);
    } catch (err) {
      console.error(err);
      setPlacing(false);
    }
  };


  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Link to="/" className="btn-amazon-primary inline-block">
            Continue Shopping
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-4 animate-page-in">
        <h1 className="text-2xl font-bold text-foreground mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: address + review */}
          <div className="lg:col-span-2 space-y-4">
            {/* Shipping address */}
            <div className="bg-card rounded-lg p-4 md:p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-amazon-navy text-white text-sm flex items-center justify-center font-bold">
                  1
                </span>
                Delivery Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={address.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    className="input-amazon"
                    placeholder="John Doe"
                  />
                  {errors.fullName && (
                    <p className="text-amazon-deal text-xs mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={address.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="input-amazon"
                    placeholder="+91 98765 43210"
                  />
                  {errors.phone && (
                    <p className="text-amazon-deal text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Address / House No. / Colony *
                  </label>
                  <input
                    type="text"
                    value={address.addressLine1}
                    onChange={(e) => handleChange("addressLine1", e.target.value)}
                    className="input-amazon"
                    placeholder="123 Main Street, Sector 5"
                  />
                  {errors.addressLine1 && (
                    <p className="text-amazon-deal text-xs mt-1">{errors.addressLine1}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Area / Landmark (optional)
                  </label>
                  <input
                    type="text"
                    value={address.addressLine2}
                    onChange={(e) => handleChange("addressLine2", e.target.value)}
                    className="input-amazon"
                    placeholder="Near City Mall"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">City *</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="input-amazon"
                    placeholder="New Delhi"
                  />
                  {errors.city && (
                    <p className="text-amazon-deal text-xs mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">State *</label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    className="input-amazon"
                    placeholder="Delhi"
                  />
                  {errors.state && (
                    <p className="text-amazon-deal text-xs mt-1">{errors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    value={address.zipCode}
                    onChange={(e) => handleChange("zipCode", e.target.value)}
                    className="input-amazon"
                    placeholder="110001"
                    maxLength={6}
                  />
                  {errors.zipCode && (
                    <p className="text-amazon-deal text-xs mt-1">{errors.zipCode}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Review items */}
            <div className="bg-card rounded-lg p-4 md:p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-amazon-navy text-white text-sm flex items-center justify-center font-bold">
                  2
                </span>
                Review Items &amp; Delivery
              </h2>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-3 py-2 border-b border-border last:border-0"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 object-contain shrink-0 bg-white rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-1 font-medium">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                      {item.product.isPrime && (
                        <span className="prime-badge text-xs">prime</span>
                      )}
                    </div>
                    <span className="font-medium text-sm shrink-0">
                      ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg p-4 sticky top-32">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Items:</span>
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
                <div className="flex justify-between text-base font-bold text-amazon-deal">
                  <span>Order Total:</span>
                  <span>₹{Math.round(total).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="btn-amazon-primary w-full mt-4 disabled:opacity-70"
              >
                {placing ? "Placing Order..." : "Place Your Order"}
              </button>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                By placing your order, you agree to ShopKart's{" "}
                <span className="amazon-link">conditions of use</span>.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
