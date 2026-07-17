package com.MakeMyTrip.makeMyTrip.repositories;

import com.MakeMyTrip.makeMyTrip.models.Recommendation;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface RecommendationRepository extends MongoRepository<Recommendation, String> {
    List<Recommendation> findByUserEmailAndDismissedFalseOrderByScoreDesc(String userEmail);
    List<Recommendation> findByUserEmailOrderByScoreDesc(String userEmail);
    void deleteByUserEmail(String userEmail);
    List<Recommendation> findByUserEmailAndEntityType(String userEmail, String entityType);
}
