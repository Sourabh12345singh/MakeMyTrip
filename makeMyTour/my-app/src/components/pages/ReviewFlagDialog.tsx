"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Flag, X } from "lucide-react";
import { reviewAPI } from "@/services/reviews";

interface ReviewFlagDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reviewId: string;
  onFlagSuccess: () => void;
}

const flagReasons = [
  "Inappropriate content",
  "Spam",
  "False information",
  "Hate speech",
  "Privacy violation",
  "Other",
];

export default function ReviewFlagDialog({
  isOpen,
  onClose,
  reviewId,
  onFlagSuccess,
}: ReviewFlagDialogProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFlag = async () => {
    if (!selectedReason && !reason.trim()) {
      alert("Please provide a reason for flagging this review");
      return;
    }

    const finalReason = selectedReason || reason.trim();

    setIsSubmitting(true);
    try {
      await reviewAPI.flagReview(reviewId, {
        flaggedByEmail: user?.email || "anonymous@example.com",
        reason: finalReason,
      });

      onFlagSuccess();
      onClose();
      setReason("");
      setSelectedReason("");
    } catch (error) {
      console.error("Failed to flag review:", error);
      alert("Failed to flag review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Flag Review</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 text-orange-600">
            <Flag size={20} />
            <p className="text-sm text-muted-foreground">
              Please let us know why you're flagging this review.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Quick Reasons</Label>
            <div className="grid gap-2">
              {flagReasons.map((flagReason) => (
                <button
                  key={flagReason}
                  type="button"
                  onClick={() => setSelectedReason(flagReason)}
                  className={`p-2 text-left rounded border transition-colors ${
            selectedReason === flagReason
                      ? "bg-orange-100 border-orange-300 text-orange-800"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {flagReason}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customReason">Custom Reason (if not in list above)</Label>
            <Textarea
              id="customReason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (e.target.value) setSelectedReason("");
              }}
              placeholder="Please describe the issue..."
              rows={3}
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-sm text-yellow-800">
              Flagged reviews will be reviewed by our moderation team and may be removed if they violate our community guidelines.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleFlag}
            disabled={isSubmitting || (!selectedReason && !reason.trim())}
          >
            {isSubmitting ? "Submitting..." : "Submit Flag"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}