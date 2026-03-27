// StarRating Component - Reusable star rating display
// Shows filled/empty stars based on rating value

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: number;
  compact?: boolean; // Hide review count text
}

const StarRating = ({ rating, reviewCount, size = 16, compact = false }: StarRatingProps) => (
  <div className="flex items-center gap-1 flex-wrap">
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={compact ? 12 : size}
          className={
            star <= Math.round(rating)
              ? "star-filled fill-current"
              : "text-muted-foreground"
          }
        />
      ))}
    </div>
    <span className={`text-amazon-link ${compact ? "text-xs" : "text-sm"} ml-0.5`}>
      {rating.toFixed(1)}
    </span>
    {!compact && reviewCount !== undefined && (
      <span className="text-sm text-amazon-link">
        ({reviewCount.toLocaleString()} ratings)
      </span>
    )}
  </div>
);

export default StarRating;
