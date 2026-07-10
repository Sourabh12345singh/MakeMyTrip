package com.MakeMyTrip.makeMyTrip.repositories;

import com.MakeMyTrip.makeMyTrip.models.FlightStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface FlightStatusRepository extends MongoRepository<FlightStatus, String> {
    Optional<FlightStatus> findTopByFlightIdOrderByLastUpdatedDesc(String flightId);
}
