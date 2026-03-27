// WishlistButton Component - Heart toggle button for product wishlist
// Can be placed on product cards or detail pages

import { Heart } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";

interface WishlistButtonProps {
  product: Product;
  className?: string;
  size?: number;
}

const WishlistButton = ({ product, className = "", size = 20 }: WishlistButtonProps) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useCart();
  const wishlisted = isInWishlist(product.id);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={`transition-all duration-200 hover:scale-110 ${className}`}
    >
      <Heart
        size={size}
        className={
          wishlisted
            ? "fill-red-500 text-red-500"
            : "text-muted-foreground hover:text-red-400"
        }
      />
    </button>
  );
};

export default WishlistButton;
