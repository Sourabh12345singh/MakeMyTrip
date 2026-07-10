package com.MakeMyTrip.makeMyTrip.repositories;

import com.MakeMyTrip.makeMyTrip.models.TrackedFlight;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TrackedFlightRepository extends MongoRepository<TrackedFlight, String> {
    List<TrackedFlight> findByUserEmail(String userEmail);
    Optional<TrackedFlight> findByUserEmailAndFlightId(String userEmail, String flightId);
    boolean existsByUserEmailAndFlightId(String userEmail, String flightId);
    List<TrackedFlight> findAllByFlightId(String flightId);
}
