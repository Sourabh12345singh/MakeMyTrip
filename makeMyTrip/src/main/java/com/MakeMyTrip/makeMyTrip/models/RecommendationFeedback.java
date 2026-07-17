package com.MakeMyTrip.makeMyTrip.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "recommendation_feedback")
public class RecommendationFeedback {
    @Id
    private String id;
    private String userEmail;
    private String recommendationId;
    private String feedbackType; // "helpful" or "irrelevant"
    private String createdAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getRecommendationId() { return recommendationId; }
    public void setRecommendationId(String recommendationId) { this.recommendationId = recommendationId; }
    public String getFeedbackType() { return feedbackType; }
    public void setFeedbackType(String feedbackType) { this.feedbackType = feedbackType; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
