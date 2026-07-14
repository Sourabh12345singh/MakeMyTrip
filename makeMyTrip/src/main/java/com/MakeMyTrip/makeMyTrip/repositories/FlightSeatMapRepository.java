package com.MakeMyTrip.makeMyTrip.repositories;

import com.MakeMyTrip.makeMyTrip.models.FlightSeatMap;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FlightSeatMapRepository extends MongoRepository<FlightSeatMap, String> {
    FlightSeatMap findByFlightId(String flightId);
}
