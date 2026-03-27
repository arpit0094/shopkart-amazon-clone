// Wishlist Page - Shows all wishlisted products
// Allows moving items to cart or removing from wishlist

import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StarRating from "@/components/StarRating";
import { useCart } from "@/context/CartContext";

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, moveToCart } = useCart();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-4 animate-page-in">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-foreground">My Wishlist</h1>
          <span className="text-sm text-muted-foreground">
            ({wishlistItems.length} item{wishlistItems.length !== 1 ? "s" : ""})
          </span>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="bg-card rounded-lg p-10 text-center">
            <Heart size={64} className="text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-medium mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Save items you like to your wishlist — review them anytime and add
              them to your cart.
            </p>
            <Link to="/" className="btn-amazon-primary inline-block">
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlistItems.map((product) => {
              const discount = product.originalPrice
                ? Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100
                  )
                : 0;

              return (
                <div
                  key={product.id}
                  className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  <Link to={`/product/${product.id}`} className="block relative">
                    <div className="aspect-square bg-white flex items-center justify-center p-4">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {discount > 0 && (
                      <span className="deal-badge absolute top-2 left-2">
                        -{discount}%
                      </span>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="p-3">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="text-sm amazon-link line-clamp-2 mb-1">
                        {product.name}
                      </h3>
                    </Link>
                    <StarRating
                      rating={product.rating}
                      reviewCount={product.reviewCount}
                      compact
                    />
                    <div className="mt-1.5">
                      <span className="font-bold text-base">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through ml-1">
                          ₹{product.originalPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    {product.isPrime && (
                      <span className="prime-badge text-xs mt-1 block w-fit">prime</span>
                    )}

                    {/* Actions */}
                    <div className="mt-3 space-y-2">
                      <button
                        onClick={() => moveToCart(product)}
                        disabled={!product.inStock}
                        className="btn-amazon-primary w-full text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <ShoppingCart size={14} />
                        {product.inStock ? "Move to Cart" : "Out of Stock"}
                      </button>
                      <button
                        onClick={() => removeFromWishlist(product.id)}
                        className="w-full text-sm text-muted-foreground hover:text-amazon-deal transition-colors flex items-center justify-center gap-1"
                      >
                        <Heart size={13} />
                        Remove from Wishlist
                      </button>
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

export default Wishlist;
