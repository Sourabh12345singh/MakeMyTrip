package com.MakeMyTrip.makeMyTrip.controllers;

import com.MakeMyTrip.makeMyTrip.models.Hotel;
import com.MakeMyTrip.makeMyTrip.repositories.HotelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
public class HotelController {

    @Autowired
    private HotelRepository hotelRepository;

    @GetMapping("/hotels")
    public List<Hotel> getAllHotels() {
        return hotelRepository.findAll();
    }

    @GetMapping("/hotels/{id}")
    public ResponseEntity<Hotel> getHotelById(@PathVariable String id) {
        Optional<Hotel> hotel = hotelRepository.findById(id);
        if (hotel.isPresent()) {
            return ResponseEntity.ok(hotel.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/admin/hotels")
    public Hotel createHotel(@RequestBody Hotel hotel) {
        return hotelRepository.save(hotel);
    }

    @PutMapping("/admin/hotels/{id}")
    public ResponseEntity<Hotel> updateHotel(@PathVariable String id, @RequestBody Hotel updatedHotel) {
        Optional<Hotel> existingOpt = hotelRepository.findById(id);
        if (existingOpt.isPresent()) {
            Hotel existing = existingOpt.get();
            existing.setHotelName(updatedHotel.getHotelName());
            existing.setLocation(updatedHotel.getLocation());
            existing.setPricePerNight(updatedHotel.getPricePerNight());
            existing.setAvailableRooms(updatedHotel.getAvailableRooms());
            existing.setAmenities(updatedHotel.getAmenities());
            return ResponseEntity.ok(hotelRepository.save(existing));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/admin/hotels/{id}")
    public ResponseEntity<Void> deleteHotel(@PathVariable String id) {
        Optional<Hotel> hotel = hotelRepository.findById(id);
        if (hotel.isPresent()) {
            hotelRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
