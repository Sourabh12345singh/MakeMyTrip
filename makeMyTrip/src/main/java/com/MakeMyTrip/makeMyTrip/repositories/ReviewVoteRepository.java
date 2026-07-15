package com.MakeMyTrip.makeMyTrip.repositories;

import com.MakeMyTrip.makeMyTrip.models.ReviewVote;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ReviewVoteRepository extends MongoRepository<ReviewVote, String> {
    ReviewVote findByReviewIdAndUserEmail(String reviewId, String userEmail);
    boolean existsByReviewIdAndUserEmail(String reviewId, String userEmail);
    int countByReviewId(String reviewId);
}
