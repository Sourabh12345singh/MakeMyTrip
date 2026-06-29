package com.MakeMyTrip.makeMyTrip.controllers;

import com.MakeMyTrip.makeMyTrip.models.Users;
import com.MakeMyTrip.makeMyTrip.services.BookingService;
import com.MakeMyTrip.makeMyTrip.services.UserServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserServices userServices;

    @PostMapping("/bookings/flight")
    public ResponseEntity<?> bookFlight(@RequestBody Map<String, Object> bookingData) {
        try {
            String email = bookingData.get("email").toString();
            String flightId = bookingData.get("flightId").toString();
            int seats = Integer.parseInt(bookingData.get("seats").toString());
            double price = Double.parseDouble(bookingData.get("price").toString());

            Users.Booking booking = bookingService.bookFlight(email, flightId, seats, price);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/bookings/hotel")
    public ResponseEntity<?> bookHotel(@RequestBody Map<String, Object> bookingData) {
        try {
            String email = bookingData.get("email").toString();
            String hotelId = bookingData.get("hotelId").toString();
            int rooms = Integer.parseInt(bookingData.get("rooms").toString());
            double price = Double.parseDouble(bookingData.get("price").toString());

            Users.Booking booking = bookingService.bookHotel(email, hotelId, rooms, price);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/bookings/{email}")
    public ResponseEntity<?> getBookingsByEmail(@PathVariable String email) {
        Users user = userServices.getUserByEmail(email);
        if (user != null) {
            return ResponseEntity.ok(user.getBookings());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
