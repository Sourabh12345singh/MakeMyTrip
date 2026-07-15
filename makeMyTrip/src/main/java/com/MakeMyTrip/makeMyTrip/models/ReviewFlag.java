package com.MakeMyTrip.makeMyTrip.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "review_flags")
public class ReviewFlag {
    @Id
    private String _id;
    private String reviewId;
    private String flaggedByEmail;
    private String reason;
    private String status;
    private String createdAt;

    public String getId() { return _id; }
    public void setId(String id) { this._id = id; }
    public String getReviewId() { return reviewId; }
    public void setReviewId(String reviewId) { this.reviewId = reviewId; }
    public String getFlaggedByEmail() { return flaggedByEmail; }
    public void setFlaggedByEmail(String flaggedByEmail) { this.flaggedByEmail = flaggedByEmail; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}