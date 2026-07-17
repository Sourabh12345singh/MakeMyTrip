package com.MakeMyTrip.makeMyTrip.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;
import java.util.Map;

@Document(collection = "recommendations")
public class Recommendation {
    @Id
    private String id;
    private String userEmail;
    private String entityType; // "Flight" or "Hotel"
    private String entityId;
    private String entityName;
    private String reason; // "You liked beaches! Try Bali."
    private String reasonCategory; // "destination_preference", "price_range", "frequent_route", "high_rating", "collaborative", "popular"
    private double score; // 0.0 to 1.0 relevance score
    private String imageUrl;
    private Map<String, Object> metadata; // extra data like price, location, etc.
    private String createdAt;
    private boolean dismissed; // user marked as irrelevant
    private boolean helpful; // user marked as helpful

    // Manual getters and setters for ALL fields
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }
    public String getEntityName() { return entityName; }
    public void setEntityName(String entityName) { this.entityName = entityName; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getReasonCategory() { return reasonCategory; }
    public void setReasonCategory(String reasonCategory) { this.reasonCategory = reasonCategory; }
    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public boolean isDismissed() { return dismissed; }
    public void setDismissed(boolean dismissed) { this.dismissed = dismissed; }
    public boolean isHelpful() { return helpful; }
    public void setHelpful(boolean helpful) { this.helpful = helpful; }
}
