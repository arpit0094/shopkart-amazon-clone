// Product Detail Page - Shows full product information
// Features image carousel with dots, wishlist, specs, and add-to-cart/buy-now actions

import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShieldCheck, Truck, RotateCcw, Share2 } from "lucide-react";
import Header from "@/components/Header";
import StarRating from "@/components/StarRating";
import RelatedProducts from "@/components/RelatedProducts";
import WishlistButton from "@/components/WishlistButton";
import Footer from "@/components/Footer";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link to="/" className="amazon-link">
            Back to Shopping
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  // Related products: same category
  const relatedProducts = products.filter((p) => p.category === product.category);

  const nextImage = () =>
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  const prevImage = () =>
    setSelectedImage(
      (prev) => (prev - 1 + product.images.length) % product.images.length
    );

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate("/checkout");
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-4 animate-page-in">
        {/* Breadcrumb */}
        <nav className="text-sm mb-4 flex items-center gap-1 flex-wrap">
          <Link to="/" className="amazon-link">
            Home
          </Link>
          <span className="text-muted-foreground">›</span>
          <button
            onClick={() =>
              navigate(`/?category=${encodeURIComponent(product.category)}`)
            }
            className="amazon-link"
          >
            {product.category}
          </button>
          <span className="text-muted-foreground">›</span>
          <span className="text-muted-foreground truncate max-w-xs">
            {product.name.slice(0, 50)}...
          </span>
        </nav>

        <div className="bg-card rounded-lg p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ── Image Carousel ────────────────────────────────── */}
            <div className="lg:col-span-1">
              {/* Main image */}
              <div className="relative aspect-square bg-white rounded-lg overflow-hidden border border-border mb-3 flex items-center justify-center">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-opacity duration-200"
                />
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card rounded-full p-1.5 shadow transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card rounded-full p-1.5 shadow transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight size={22} />
                    </button>
                  </>
                )}
                {discount > 0 && (
                  <span className="deal-badge absolute top-3 left-3">
                    -{discount}%
                  </span>
                )}
              </div>

              {/* Thumbnail strip */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all ${
                      selectedImage === idx
                        ? "border-amazon-orange shadow-md"
                        : "border-border opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`View ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>

              {/* Dot indicators */}
              {product.images.length > 1 && (
                <div className="flex gap-1.5 justify-center mt-3">
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`rounded-full transition-all ${
                        i === selectedImage
                          ? "w-5 h-2 bg-amazon-orange"
                          : "w-2 h-2 bg-border hover:bg-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── Product Info ──────────────────────────────────── */}
            <div className="lg:col-span-1">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h1 className="text-xl md:text-2xl font-medium text-foreground leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2 shrink-0">
                  <WishlistButton product={product} size={22} />
                  <button
                    onClick={handleShare}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title="Copy link"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              <p className="text-sm text-amazon-link mb-2">
                Visit the {product.brand} Store
              </p>

              <StarRating rating={product.rating} reviewCount={product.reviewCount} />

              {product.isPrime && (
                <span className="prime-badge mt-2 inline-block">prime</span>
              )}

              <hr className="my-3 border-border" />

              {/* Price section */}
              <div className="mb-3">
                {discount > 0 && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="deal-badge">-{discount}%</span>
                    <span className="text-sm text-muted-foreground line-through">
                      M.R.P.: ₹{product.originalPrice?.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-muted-foreground">₹</span>
                  <span className="text-3xl font-medium text-foreground">
                    {product.price.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Inclusive of all taxes
                </p>
                <p className="text-sm text-amazon-teal font-medium mt-1">
                  {product.price > 499 ? "FREE Delivery" : "Delivery: ₹49"}
                </p>
              </div>

              <hr className="my-3 border-border" />

              {/* About this item */}
              <div className="mb-4">
                <h3 className="font-bold text-sm mb-2">About this item</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Specifications table */}
              <div>
                <h3 className="font-bold text-sm mb-2">Technical Details</h3>
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <tr key={key} className="border-t border-border">
                        <td className="py-2 pr-4 font-medium text-muted-foreground w-2/5">
                          {key}
                        </td>
                        <td className="py-2 text-foreground">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Buy Box ───────────────────────────────────────── */}
            <div className="lg:col-span-1">
              <div className="border border-border rounded-lg p-4">
                <div className="text-2xl font-medium text-foreground mb-1">
                  ₹{product.price.toLocaleString("en-IN")}
                </div>
                {discount > 0 && (
                  <p className="text-xs text-amazon-deal mb-1">
                    You save ₹{(product.originalPrice! - product.price).toLocaleString("en-IN")} ({discount}%)
                  </p>
                )}
                <p className="text-sm text-amazon-teal font-medium mb-1">
                  {product.price > 499 ? "FREE Delivery" : "Delivery: ₹49"}
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  Fastest delivery:{" "}
                  <span className="font-medium text-foreground">Tomorrow</span>
                </p>

                {/* Stock status */}
                <p
                  className={`text-lg mb-3 font-semibold ${
                    product.inStock ? "text-amazon-teal" : "text-amazon-deal"
                  }`}
                >
                  {product.inStock ? "In Stock" : "Currently Unavailable"}
                </p>

                {product.inStock && (
                  <>
                    {/* Quantity selector */}
                    <div className="flex items-center gap-2 mb-4">
                      <label className="text-sm font-medium">Qty:</label>
                      <select
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="border border-border rounded px-2 py-1 text-sm bg-secondary"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Action buttons */}
                    <button
                      onClick={() => addToCart(product, quantity)}
                      className="btn-amazon-primary w-full mb-2"
                    >
                      Add to Cart
                    </button>
                    <button onClick={handleBuyNow} className="btn-amazon-orange w-full mb-4">
                      Buy Now
                    </button>
                  </>
                )}

                {/* Trust badges */}
                <div className="space-y-2 text-xs text-muted-foreground border-t border-border pt-3">
                  <div className="flex items-center gap-2">
                    <Truck size={16} />
                    <span>Free delivery on orders above ₹499</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw size={16} />
                    <span>10 days return policy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} />
                    <span>Secure transaction</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        <RelatedProducts
          products={relatedProducts}
          currentProductId={product.id}
          title={`More from ${product.brand} & ${product.category}`}
        />
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
