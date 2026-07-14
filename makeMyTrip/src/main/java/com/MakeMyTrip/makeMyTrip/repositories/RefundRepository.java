package com.MakeMyTrip.makeMyTrip.repositories;

import com.MakeMyTrip.makeMyTrip.models.Refund;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface RefundRepository extends MongoRepository<Refund, String> {
    List<Refund> findByUserEmailOrderByRequestedAtDesc(String userEmail);
    List<Refund> findByStatus(String status);
}
