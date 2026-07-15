package com.MakeMyTrip.makeMyTrip.repositories;

import com.MakeMyTrip.makeMyTrip.models.ReviewFlag;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ReviewFlagRepository extends MongoRepository<ReviewFlag, String> {
    List<ReviewFlag> findByStatusOrderByCreatedAtDesc(String status);
    List<ReviewFlag> findByReviewId(String reviewId);
}
