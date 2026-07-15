package com.MakeMyTrip.makeMyTrip.repositories;

import com.MakeMyTrip.makeMyTrip.models.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, String entityId);
    List<Review> findByEntityTypeAndEntityIdOrderByHelpfulCountDesc(String entityType, String entityId);
    List<Review> findByEntityTypeAndEntityIdOrderByRatingDesc(String entityType, String entityId);
    List<Review> findByEntityTypeAndEntityIdOrderByRatingAsc(String entityType, String entityId);
    List<Review> findByUserEmail(String userEmail);
}
