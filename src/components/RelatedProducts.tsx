// RelatedProducts Component - Horizontal scroll section of related items
// Shown on Product Detail page to encourage upsell

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Product } from "@/types";
import StarRating from "@/components/StarRating";
import { useCart } from "@/context/CartContext";

interface RelatedProductsProps {
  products: Product[];
  currentProductId: string;
  title?: string;
}

const RelatedProducts = ({
  products,
  currentProductId,
  title = "Customers also bought",
}: RelatedProductsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  const related = products
    .filter((p) => p.id !== currentProductId)
    .slice(0, 8);

  if (related.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 240 : -240, behavior: "smooth" });
  };

  return (
    <section className="bg-card rounded-lg p-4 md:p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            className="p-1.5 rounded-full bg-secondary hover:bg-muted border border-border transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1.5 rounded-full bg-secondary hover:bg-muted border border-border transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
      >
        {related.map((product) => (
          <div
            key={product.id}
            className="shrink-0 w-44 bg-background rounded-lg border border-border p-3 flex flex-col hover:shadow-md transition-shadow"
          >
            <Link to={`/product/${product.id}`} className="block mb-2">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-36 object-contain hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </Link>
            <Link to={`/product/${product.id}`}>
              <p className="text-xs amazon-link line-clamp-2 mb-1">{product.name}</p>
            </Link>
            <div className="mt-auto">
              <StarRating rating={product.rating} reviewCount={product.reviewCount} compact />
              <p className="text-sm font-bold mt-1">₹{product.price.toLocaleString("en-IN")}</p>
              {product.isPrime && (
                <span className="prime-badge text-xs">prime</span>
              )}
              <button
                onClick={() => addToCart(product)}
                disabled={!product.inStock}
                className="btn-amazon-primary w-full mt-2 text-xs py-1.5 disabled:opacity-50"
              >
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
