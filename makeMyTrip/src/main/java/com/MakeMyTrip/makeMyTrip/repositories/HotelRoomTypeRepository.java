package com.MakeMyTrip.makeMyTrip.repositories;

import com.MakeMyTrip.makeMyTrip.models.HotelRoomType;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface HotelRoomTypeRepository extends MongoRepository<HotelRoomType, String> {
    List<HotelRoomType> findByHotelId(String hotelId);
}
