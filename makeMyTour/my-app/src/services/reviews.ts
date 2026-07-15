import api from "@/lib/axios";

export interface Review {
  _id?: string;
  id?: string;
  entityType: string;
  entityId: string;
  userEmail: string;
  userName: string;
  rating: number;
  title: string;
  description: string;
  imageUrls: string[];
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewReply {
  _id?: string;
  id?: string;
  reviewId: string;
  userEmail: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface ReviewVote {
  _id?: string;
  id?: string;
  reviewId: string;
  userEmail: string;
  type: string;
  createdAt: string;
}

export interface ReviewFlag {
  _id?: string;
  id?: string;
  reviewId: string;
  flaggedByEmail: string;
  reason: string;
  status: string;
  createdAt: string;
}

export const reviewAPI = {
  // Create a new review (multipart form data for image uploads)
  createReview: async (formData: FormData): Promise<Review> => {
    const res = await api.post("/api/reviews/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Get reviews for an entity with sorting
  getReviews: async (entityType: string, entityId: string, sortBy: string = "newest"): Promise<Review[]> => {
    const res = await api.get(`/api/reviews/${entityType}/${entityId}`, {
      params: { sortBy },
    });
    return res.data;
  },

  // Get a single review by ID
  getReview: async (reviewId: string): Promise<Review> => {
    const res = await api.get(`/api/reviews/${reviewId}`);
    return res.data;
  },

  // Update an existing review
  updateReview: async (reviewId: string, data: { title: string; description: string; rating: number }): Promise<Review> => {
    const params = new URLSearchParams();
    params.append("title", data.title);
    params.append("description", data.description);
    params.append("rating", data.rating.toString());
    const res = await api.put(`/api/reviews/${reviewId}?${params.toString()}`);
    return res.data;
  },

  // Delete a review
  deleteReview: async (reviewId: string): Promise<void> => {
    await api.delete(`/api/reviews/${reviewId}`);
  },

  // Get replies for a review
  getReplies: async (reviewId: string): Promise<ReviewReply[]> => {
    const res = await api.get(`/api/reviews/${reviewId}/replies`);
    return res.data;
  },

  // Add a reply to a review
  addReply: async (reviewId: string, data: { userEmail: string; userName: string; text: string }): Promise<ReviewReply> => {
    const params = new URLSearchParams();
    params.append("userEmail", data.userEmail);
    params.append("userName", data.userName);
    params.append("text", data.text);
    const res = await api.post(`/api/reviews/${reviewId}/replies?${params.toString()}`);
    return res.data;
  },

  // Flag a review as inappropriate
  flagReview: async (reviewId: string, data: { flaggedByEmail: string; reason: string }): Promise<ReviewFlag> => {
    const params = new URLSearchParams();
    params.append("flaggedByEmail", data.flaggedByEmail);
    params.append("reason", data.reason);
    const res = await api.post(`/api/reviews/${reviewId}/flags?${params.toString()}`);
    return res.data;
  },

  // Vote on a review
  voteOnReview: async (reviewId: string, data: { userEmail: string; type: string }): Promise<ReviewVote> => {
    const params = new URLSearchParams();
    params.append("userEmail", data.userEmail);
    params.append("type", data.type);
    const res = await api.post(`/api/reviews/${reviewId}/votes?${params.toString()}`);
    return res.data;
  },

  // Get user vote type for a review
  getUserVote: async (reviewId: string, userEmail: string): Promise<string | null> => {
    const res = await api.get(`/api/reviews/${reviewId}/votes/${userEmail}`);
    return res.data;
  },

  // Check if user has voted on a review
  hasUserVoted: async (reviewId: string, userEmail: string): Promise<boolean> => {
    const res = await api.get(`/api/reviews/${reviewId}/votes/exists/${userEmail}`);
    return res.data;
  },

  // Admin: Get pending flagged reviews
  getPendingFlags: async (): Promise<Review[]> => {
    const res = await api.get("/api/reviews/flags/pending");
    return res.data;
  },

  // Admin: Resolve a flag
  resolveFlag: async (flagId: string, data: { action: string; resolvedBy: string }): Promise<any> => {
    const params = new URLSearchParams();
    params.append("action", data.action);
    params.append("resolvedBy", data.resolvedBy);
    const res = await api.put(`/api/reviews/flags/${flagId}/resolve?${params.toString()}`);
    return res.data;
  },

  // Seed demo reviews for an entity
  seedDemoReviews: async (entityType: string, entityId: string): Promise<Review[]> => {
    const res = await api.post(`/api/reviews/seed/${entityType}/${entityId}`);
    return res.data;
  },
};
