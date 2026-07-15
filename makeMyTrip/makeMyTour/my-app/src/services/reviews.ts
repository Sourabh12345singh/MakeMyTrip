import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export interface Review {
  _id: string;
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
  _id: string;
  reviewId: string;
  userEmail: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface ReviewFlag {
  _id: string;
  reviewId: string;
  flaggedByEmail: string;
  reason: string;
  status: string;
  createdAt: string;
}

export interface ReviewVote {
  _id: string;
  reviewId: string;
  userEmail: string;
  type: string;
  createdAt: string;
}

export const reviewAPI = {
  createReview: async (reviewData: FormData) => {
    const response = await axios.post<Review>(
      `${API_BASE_URL}/api/reviews/",
      reviewData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  getReviews: async (entityType: string, entityId: string, sortBy: string = "newest") => {
    const response = await axios.get<Review[]>
    (`${API_BASE_URL}/api/reviews/${entityType}/${entityId}?sortBy=${sortBy}`);
    return response.data;
  },

  getReview: async (reviewId: string) => {
    const response = await axios.get<Review>(`${API_BASE_URL}/api/reviews/${reviewId}`);
    return response.data;
  },

  addReply: async (reviewId: string, data: { userEmail: string; userName: string; text: string }) => {
    const response = await axios.post<ReviewReply>
    (`${API_BASE_URL}/api/reviews/${reviewId}/replies`, data);
    return response.data;
  },

  getReplies: async (reviewId: string) => {
    const response = await axios.get<ReviewReply[]>(`${API_BASE_URL}/api/reviews/${reviewId}/replies`);
    return response.data;
  },

  flagReview: async (reviewId: string, data: { flaggedByEmail: string; reason: string }) => {
    const response = await axios.post<ReviewFlag>
    (`${API_BASE_URL}/api/reviews/${reviewId}/flags`, data);
    return response.data;
  },

  getPendingFlags: async () => {
    const response = await axios.get<Review[]>(`${API_BASE_URL}/api/reviews/flags/pending`);
    return response.data;
  },

  resolveFlag: async (flagId: string, action: string, resolvedBy: string) => {
    const response = await axios.put
    (`${API_BASE_URL}/api/reviews/flags/${flagId}/resolve?action=${action}&resolvedBy=${resolvedBy}`);
    return response.data;
  },

  voteOnReview: async (reviewId: string, data: { userEmail: string; type: string }) => {
    const response = await axios.post<ReviewVote>
    (`${API_BASE_URL}/api/reviews/${reviewId}/votes`, data);
    return response.data;
  },

  getVoteType: async (reviewId: string, userEmail: string) => {
    const response = await axios.get<string>
    (`${API_BASE_URL}/api/reviews/${reviewId}/votes/${userEmail}`);
    return response.data;
  },

  existsUserVote: async (reviewId: string, userEmail: string) => {
    const response = await axios.get<boolean>
    (`${API_BASE_URL}/api/reviews/${reviewId}/votes/exists/${userEmail}`);
    return response.data;
  },

  deleteReview: async (reviewId: string) => {
    await axios.delete(`${API_BASE_URL}/api/reviews/${reviewId}`);
  },
};
