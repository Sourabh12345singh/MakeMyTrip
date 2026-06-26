package com.MakeMyTrip.makeMyTrip.repositories;
import com.MakeMyTrip.makeMyTrip.models.Flight;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FlightRepository extends MongoRepository<Flight , String> {
}