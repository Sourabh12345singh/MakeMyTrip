package com.MakeMyTrip.makeMyTrip.repositories;

import com.MakeMyTrip.makeMyTrip.models.ReviewReply;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ReviewReplyRepository extends MongoRepository<ReviewReply, String> {
    List<ReviewReply> findByReviewIdOrderByCreatedAtAsc(String reviewId);
}
