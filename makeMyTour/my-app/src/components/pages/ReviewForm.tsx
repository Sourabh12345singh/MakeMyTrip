"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { reviewAPI } from "@/services/reviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { X, Star, Image } from "lucide-react";

interface ReviewFormProps {
  entityType: string;
  entityId: string;
  entityName: string;
  userEmail: string;
  onReviewSubmitted: () => void;
}

export default function ReviewForm({
  entityType,
  entityId,
  entityName,
  userEmail,
  onReviewSubmitted,
}: ReviewFormProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    title: "",
    description: "",
    imageFiles: [] as File[],
    imagePreviewUrls: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.rating === 0) {
      alert("Please select a rating");
      return;
    }
    if (!formData.title.trim()) {
      alert("Please provide a title");
      return;
    }
    if (!formData.description.trim()) {
      alert("Please provide a description");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("entityType", entityType);
      formDataToSend.append("entityId", entityId);
      formDataToSend.append("userEmail", userEmail);
      formDataToSend.append("userName", user ? `${user.firstName} ${user.lastName}` : "Anonymous");
      formDataToSend.append("rating", formData.rating.toString());
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);

      formData.imageFiles.forEach((file) => {
        formDataToSend.append("images", file);
      });

      await reviewAPI.createReview(formDataToSend);

      setFormData({
        rating: 0,
        title: "",
        description: "",
        imageFiles: [],
        imagePreviewUrls: [],
      });
      setIsOpen(false);
      onReviewSubmitted();
    } catch (error) {
      console.error("Failed to create review:", error);
      alert("Failed to create review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const previewUrls = files.map((file) => URL.createObjectURL(file));
      setFormData({
        ...formData,
        imageFiles: [...formData.imageFiles, ...files],
        imagePreviewUrls: [...formData.imagePreviewUrls, ...previewUrls],
      });
    }
  };

  const removeImage = (index: number) => {
    const newFiles = [...formData.imageFiles];
    const newPreviews = [...formData.imagePreviewUrls];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setFormData({
      ...formData,
      imageFiles: newFiles,
      imagePreviewUrls: newPreviews,
    });
  };

  return (
    <div>
      <Button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Star size={16} />
        Write a Review
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Write a Review for {entityName}</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X size={16} />
              </Button>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Rating *</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
              formData.rating >= star
                        ? "bg-yellow-400 border-yellow-500 text-white"
                        : "bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    <Star size={16} fill={formData.rating >= star ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
              {formData.rating === 0 && (
                <p className="text-sm text-red-500">Please select a rating</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Excellent service!"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Share your experience..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Upload Photos (Optional)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Label
                  htmlFor="images"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Image size={24} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Click to upload images (max 10MB each)
                  </span>
                </Label>
              </div>

              {formData.imagePreviewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {formData.imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}