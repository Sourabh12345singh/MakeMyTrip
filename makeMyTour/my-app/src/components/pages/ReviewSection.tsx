"use client";

import { useState, useEffect } from "react";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import { Review } from "@/services/reviews";
import { reviewAPI } from "@/services/reviews";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StarRating from "./StarRating";
import { Plus, X } from "lucide-react";

interface ReviewSectionProps {
  entityType: string;
  entityId: string;
  entityName: string;
  userEmail: string;
  isAuthenticated: boolean;
}

export default function ReviewSection({
  entityType,
  entityId,
  entityName,
  userEmail,
  isAuthenticated,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [entityType, entityId, sortBy]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await reviewAPI.getReviews(entityType, entityId, sortBy);
      setReviews(data);
      if (data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAverageRating(avg);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    fetchReviews();
    setIsReviewDialogOpen(false);
  };

  const renderSortOptions = () => {
    const options = [
      { value: "newest", label: "Newest" },
      { value: "most_helpful", label: "Most Helpful" },
      { value: "highest_rated", label: "Highest Rated" },
      { value: "lowest_rated", label: "Lowest Rated" },
    ];

    return (
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option.value}
            variant={sortBy === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy(option.value)}
            className={`text-xs ${
              sortBy === option.value
                ? "bg-sky-500 hover:bg-sky-600 text-white"
                : "border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            {option.label}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/40 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Reviews & Ratings</h2>
          <div className="flex items-center gap-3 mt-2">
            <StarRating rating={Math.round(averageRating)} size={16} />
            <span className="text-sm text-slate-400">
              {averageRating > 0
                ? `${averageRating.toFixed(1)} avg · ${reviews.length} review${reviews.length !== 1 ? "s" : ""}`
                : "No reviews yet"}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {renderSortOptions()}
          {isAuthenticated && (
            <Button
              onClick={() => setIsReviewDialogOpen(true)}
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white"
            >
              <Plus size={16} />
              Write Review
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse bg-slate-800/50 h-32 rounded-lg border border-slate-700/30" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 border border-slate-700/40 rounded-xl bg-black/40 backdrop-blur-md">
          <h3 className="text-lg font-medium mb-2 text-white">No reviews yet</h3>
          <p className="text-slate-400 mb-4">
            Be the first to share your experience with {entityName}!
          </p>
          {isAuthenticated && (
            <Button onClick={() => setIsReviewDialogOpen(true)} className="bg-sky-500 hover:bg-sky-600 text-white">
              Write a Review
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id || review.id}
              review={review}
              entityType={entityType}
              onReviewUpdate={fetchReviews}
            />
          ))}
        </div>
      )}

      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 text-white">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white">Write a Review</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReviewDialogOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </Button>
            </div>
          </DialogHeader>
          <ReviewForm
            entityType={entityType}
            entityId={entityId}
            entityName={entityName}
            userEmail={userEmail}
            onReviewSubmitted={handleReviewSubmitted}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
