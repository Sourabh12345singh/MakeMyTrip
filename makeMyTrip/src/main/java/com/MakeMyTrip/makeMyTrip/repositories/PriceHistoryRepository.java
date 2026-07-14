package com.MakeMyTrip.makeMyTrip.repositories;

import com.MakeMyTrip.makeMyTrip.models.PriceHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PriceHistoryRepository extends MongoRepository<PriceHistory, String> {
    List<PriceHistory> findByFlightIdOrderByTimestampAsc(String flightId);
}
