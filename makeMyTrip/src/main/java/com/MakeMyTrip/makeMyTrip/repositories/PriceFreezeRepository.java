package com.MakeMyTrip.makeMyTrip.repositories;

import com.MakeMyTrip.makeMyTrip.models.PriceFreeze;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface PriceFreezeRepository extends MongoRepository<PriceFreeze, String> {
    Optional<PriceFreeze> findByUserEmailAndFlightIdAndConsumedFalse(String userEmail, String flightId);
    List<PriceFreeze> findByUserEmailAndConsumedFalse(String userEmail);
}
