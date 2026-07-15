"use client";

import { useState, useEffect } from "react";
import { Review } from "@/services/reviews";
import { ReviewReply } from "@/services/reviews";
import { ReviewVote } from "@/services/reviews";
import { reviewAPI } from "@/services/reviews";
import { API_BASE_URL } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, MessageCircle, Flag, Reply, Pencil, Trash2, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import StarRating from "./StarRating";
import ReviewFlagDialog from "./ReviewFlagDialog";

interface ReviewCardProps {
  review: Review;
  entityType: string;
  onReviewUpdate: () => void;
}

export default function ReviewCard({ review, entityType, onReviewUpdate }: ReviewCardProps) {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isVoting, setIsVoting] = useState(false);
  const [userVote, setUserVote] = useState<ReviewVote | null>(null);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editedTitle, setEditedTitle] = useState(review.title);
  const [editedDescription, setEditedDescription] = useState(review.description);
  const [replies, setReplies] = useState<ReviewReply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  useEffect(() => {
    if (showReplyForm) {
      loadReplies();
    }
  }, [showReplyForm]);

  useEffect(() => {
    if (user?.email) {
      reviewAPI.getUserVote((review._id || review.id as string), user.email).then((voteType) => {
        if (voteType) {
          setUserVote({ type: voteType, userEmail: user.email } as ReviewVote);
        }
      }).catch(() => {});
    }
  }, [(review._id || review.id as string), user?.email]);

  const loadReplies = async () => {
    setLoadingReplies(true);
    try {
      const data = await reviewAPI.getReplies((review._id || review.id as string));
      setReplies(data);
    } catch (error) {
      console.error("Failed to load replies:", error);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleVote = async (type: "HELPFUL" | "NOT_HELPFUL") => {
    if (!user) {
      alert("Please login to vote on reviews");
      return;
    }

    if (isVoting) return;
    setIsVoting(true);

    try {
      if (userVote?.type === type) {
        alert("You have already voted this way on this review");
        return;
      }

      if (userVote) {
        throw new Error("User has already voted on this review");
      }

      await reviewAPI.voteOnReview((review._id || review.id as string), {
        userEmail: user.email,
        type: type,
      });

      setUserVote({ type: type, userEmail: user.email } as ReviewVote);
      onReviewUpdate();
    } catch (error: any) {
      console.error("Failed to vote:", error);
      alert(error.response?.data?.message || "Failed to vote on review");
    } finally {
      setIsVoting(false);
    }
  };

  const handleReply = async () => {
    if (!user) {
      alert("Please login to reply to reviews");
      return;
    }

    if (!replyText.trim()) return;

    try {
      await reviewAPI.addReply((review._id || review.id as string), {
        userEmail: user.email,
        userName: `${user.firstName} ${user.lastName}`,
        text: replyText,
      });

      setReplyText("");
      setShowReplyForm(false);
      loadReplies();
    } catch (error) {
      console.error("Failed to add reply:", error);
    }
  };

  const handleDeleteReview = async () => {
    if (confirm("Are you sure you want to delete this review?")) {
      try {
        await reviewAPI.deleteReview((review._id || review.id as string));
        onReviewUpdate();
      } catch (error) {
        console.error("Failed to delete review:", error);
      }
    }
  };

  const handleEditReview = async () => {
    try {
      await reviewAPI.updateReview((review._id || review.id as string), {
        title: editedTitle,
        description: editedDescription,
        rating: review.rating,
      });
      setShowEditForm(false);
      onReviewUpdate();
    } catch (error) {
      console.error("Failed to update review:", error);
      alert("Failed to update review");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="font-semibold">By {review.userName}</div>
            <StarRating rating={review.rating} size={16} />
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date(review.createdAt).toLocaleDateString()}
          </div>
        </div>
        <CardTitle>{review.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{review.description}</p>

        {review.imageUrls.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {review.imageUrls.map((url, index) => (
              <img
                key={index}
                src={url.startsWith('/') ? `${API_BASE_URL}${url}` : url}
                alt={`Review image ${index + 1}`}
                className="w-24 h-24 object-cover rounded"
                onError={(e) => {
                  e.currentTarget.src = `https://picsum.photos/seed/${review.id || review._id}${index}/200/200`;
                }}
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleVote("HELPFUL")}
              disabled={isVoting || userVote?.type === "HELPFUL"}
              className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${userVote?.type === "HELPFUL" ? "bg-green-100 text-green-700" : "hover:bg-gray-100"} ${isVoting ? "opacity-50" : ""}`}
            >
              <ThumbsUp size={14} />
              <span>{review.helpfulCount || 0}</span>
            </button>

            <button
              onClick={() => handleVote("NOT_HELPFUL")}
              disabled={isVoting || userVote?.type === "NOT_HELPFUL"}
              className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${userVote?.type === "NOT_HELPFUL" ? "bg-red-100 text-red-700" : "hover:bg-gray-100"} ${isVoting ? "opacity-50" : ""}`}
            >
              <ThumbsDown size={14} />
            </button>

            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 px-2 py-1 rounded text-sm hover:bg-gray-100"
            >
              <MessageCircle size={14} />
              <span>Reply</span>
              {replies.length > 0 && ` (${replies.length})`}
            </button>

            <button
              onClick={() => setShowFlagDialog(true)}
              className="flex items-center gap-1 px-2 py-1 rounded text-sm hover:bg-gray-100"
            >
              <Flag size={14} />
              <span>Flag</span>
            </button>
          </div>

          {user && user.email === review.userEmail && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditForm(!showEditForm)}
                className="flex items-center gap-1 px-2 py-1 rounded text-sm hover:bg-blue-100"
              >
                <Pencil size={14} />
                <span>Edit</span>
              </button>
              <button
                onClick={handleDeleteReview}
                className="flex items-center gap-1 px-2 py-1 rounded text-sm hover:bg-red-100 text-red-600"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        {showEditForm && (
          <div className="space-y-3 mt-4 p-4 bg-gray-50 rounded">
            <h4 className="font-semibold">Edit Review</h4>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Title"
            />
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Description"
              rows={3}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setShowEditForm(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleEditReview}>
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {showReplyForm && (
          <div className="space-y-3 mt-4 p-4 bg-blue-50 rounded">
            <h4 className="font-semibold">Add Reply</h4>
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
              rows={3}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setShowReplyForm(false)} variant="outline">
                Cancel
              </Button>
              <Button size="sm" onClick={handleReply}>
                Post Reply
              </Button>
            </div>
          </div>
        )}

        {loadingReplies ? (
          <div className="text-center py-2 text-sm text-muted-foreground">
            Loading replies...
          </div>
        ) : replies.length > 0 && (
          <div className="space-y-2 mt-4 pl-4 border-l-2 border-gray-200">
            <div className="text-sm font-semibold text-muted-foreground">
              Replies ({replies.length})
            </div>
            {replies.map((reply) => (
              <div key={reply._id || reply.id} className="text-sm">
                <span className="font-semibold">{reply.userName}:</span> {reply.text}
                <div className="text-xs text-muted-foreground">
                  {new Date(reply.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        <ReviewFlagDialog
          isOpen={showFlagDialog}
          onClose={() => setShowFlagDialog(false)}
          reviewId={(review._id || review.id as string)}
          onFlagSuccess={() => {
            onReviewUpdate();
            setShowFlagDialog(false);
          }}
        />
      </CardContent>
    </Card>
  );
}