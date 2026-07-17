import api from "@/lib/axios";

export interface RecommendationMetadata {
  price?: number;
  pricePerNight?: number;
  from?: string;
  to?: string;
  location?: string;
  amenities?: string;
  departure?: string;
  avgRating?: number;
  reviewCount?: number;
  similarTravelers?: number;
}

export interface Recommendation {
  id: string;
  userEmail: string;
  entityType: string; // "Flight" or "Hotel"
  entityId: string;
  entityName: string;
  reason: string;
  reasonCategory: string;
  score: number;
  imageUrl: string;
  metadata: RecommendationMetadata;
  createdAt: string;
  dismissed: boolean;
  helpful: boolean;
}

export interface RecommendationFeedback {
  id: string;
  userEmail: string;
  recommendationId: string;
  feedbackType: string;
  createdAt: string;
}

export const recommendationAPI = {
  getRecommendations: async (userEmail: string): Promise<Recommendation[]> => {
    const res = await api.get(`/api/recommendations/${encodeURIComponent(userEmail)}`);
    return res.data;
  },

  generateRecommendations: async (userEmail: string): Promise<Recommendation[]> => {
    const res = await api.post(`/api/recommendations/generate/${encodeURIComponent(userEmail)}`);
    return res.data;
  },

  submitFeedback: async (recommendationId: string, userEmail: string, feedbackType: string): Promise<RecommendationFeedback> => {
    const params = new URLSearchParams();
    params.append("recommendationId", recommendationId);
    params.append("userEmail", userEmail);
    params.append("feedbackType", feedbackType);
    const res = await api.post(`/api/recommendations/feedback?${params.toString()}`);
    return res.data;
  },
};
