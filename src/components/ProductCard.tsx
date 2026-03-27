// ProductCard Component - Displays a product in the grid layout
// Shows image, name, price, rating, prime badge, wishlist, and add-to-cart action

import { Link } from "react-router-dom";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import StarRating from "@/components/StarRating";
import WishlistButton from "@/components/WishlistButton";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="product-card flex flex-col h-full animate-fade-in relative">
      {/* Wishlist button – top right */}
      <div className="absolute top-2 right-2 z-10">
        <WishlistButton product={product} size={18} />
      </div>

      {/* Product image */}
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square mb-3 overflow-hidden rounded bg-card flex items-center justify-center">
          <img
            src={product.images[0]}
            alt={product.name}
            className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {/* Discount badge */}
          {discount > 0 && (
            <span className="deal-badge absolute top-2 left-2">
              -{discount}%
            </span>
          )}
        </div>
      </Link>

      {/* Product details */}
      <div className="flex flex-col flex-1">
        {/* product name */}
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm amazon-link line-clamp-2 mb-1">
            {product.name}
          </h3>
        </Link>

        {/* Star rating */}
        <StarRating rating={product.rating} reviewCount={product.reviewCount} size={13} compact />

        {/* Prime badge */}
        {product.isPrime && (
          <span className="prime-badge mt-1 w-fit">prime</span>
        )}

        {/* Price */}
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-sm text-muted-foreground">₹</span>
            <span className="text-lg font-bold text-foreground">
              {product.price.toLocaleString("en-IN")}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <p className="text-xs text-amazon-teal mt-0.5">
            {product.price > 499 ? "FREE Delivery" : "Delivery: ₹49"}
          </p>
        </div>

        {/* Add to Cart button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            addToCart(product);
          }}
          disabled={!product.inStock}
          className="btn-amazon-primary w-full mt-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {product.inStock ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
