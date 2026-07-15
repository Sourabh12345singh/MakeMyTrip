"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 20,
  interactive = false,
  onRatingChange,
}: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: maxRating }, (_, i) => {
        const starValue = i + 1;
        return (
          <button
            key={i}
            onClick={() => interactive && onRatingChange?.(starValue)}
            disabled={!interactive}
            className={
              `transition-all duration-200 \
               ${starValue <= rating
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300 fill-none hover:text-yellow-200"}
               ${interactive && "hover:scale-110"}
              `
            }
          >
            <Star size={size} />
          </button>
        );
      })}
    </div>
  );
}
