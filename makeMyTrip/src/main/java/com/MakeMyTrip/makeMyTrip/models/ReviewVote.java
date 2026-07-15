package com.MakeMyTrip.makeMyTrip.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "review_votes")
@CompoundIndex(name = "review_user_idx", def = "{'reviewId': 1, 'userEmail': 1}", unique = true)
public class ReviewVote {
    @Id
    private String _id;
    private String reviewId;
    private String userEmail;
    private String type;
    private String createdAt;

    public String getId() { return _id; }
    public void setId(String id) { this._id = id; }
    public String getReviewId() { return reviewId; }
    public void setReviewId(String reviewId) { this.reviewId = reviewId; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}