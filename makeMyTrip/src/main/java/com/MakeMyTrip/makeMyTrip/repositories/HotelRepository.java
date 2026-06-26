package com.MakeMyTrip.makeMyTrip.repositories;

import com.MakeMyTrip.makeMyTrip.models.Hotel;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface HotelRepository extends MongoRepository<Hotel , String> {
}
