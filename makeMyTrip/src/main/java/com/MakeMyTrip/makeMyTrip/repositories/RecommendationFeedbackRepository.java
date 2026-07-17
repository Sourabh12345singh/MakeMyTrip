package com.MakeMyTrip.makeMyTrip.repositories;

import com.MakeMyTrip.makeMyTrip.models.RecommendationFeedback;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface RecommendationFeedbackRepository extends MongoRepository<RecommendationFeedback, String> {
    List<RecommendationFeedback> findByUserEmail(String userEmail);
    List<RecommendationFeedback> findByRecommendationId(String recommendationId);
}
