package com.MakeMyTrip.makeMyTrip.controllers;

import com.MakeMyTrip.makeMyTrip.models.*;
import com.MakeMyTrip.makeMyTrip.services.SeatSelectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SeatSelectionController {

    @Autowired
    private SeatSelectionService seatSelectionService;

    @GetMapping("/seats/{flightId}")
    public ResponseEntity<?> getSeatMap(@PathVariable String flightId) {
        try {
            FlightSeatMap seatMap = seatSelectionService.getSeatMap(flightId);
            return ResponseEntity.ok(seatMap);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/seats/book")
    public ResponseEntity<?> bookSeats(@RequestBody Map<String, Object> data) {
        try {
            String flightId = data.get("flightId").toString();
            @SuppressWarnings("unchecked")
            List<String> seatNumbers = (List<String>) data.get("seatNumbers");
            FlightSeatMap seatMap = seatSelectionService.bookSeats(flightId, seatNumbers);
            return ResponseEntity.ok(seatMap);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/rooms/{hotelId}")
    public ResponseEntity<?> getRoomTypes(@PathVariable String hotelId) {
        try {
            List<HotelRoomType> roomTypes = seatSelectionService.getRoomTypes(hotelId);
            return ResponseEntity.ok(roomTypes);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/rooms/book")
    public ResponseEntity<?> bookRoomType(@RequestBody Map<String, Object> data) {
        try {
            String hotelId = data.get("hotelId").toString();
            String roomTypeId = data.get("roomTypeId").toString();
            int quantity = Integer.parseInt(data.get("quantity").toString());
            HotelRoomType roomType = seatSelectionService.bookRoomType(hotelId, roomTypeId, quantity);
            return ResponseEntity.ok(roomType);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/preferences/{email}")
    public ResponseEntity<?> getPreferences(@PathVariable String email) {
        List<SavedPreference> prefs = seatSelectionService.getPreferences(email);
        return ResponseEntity.ok(prefs);
    }

    @PostMapping("/preferences/save")
    public ResponseEntity<?> savePreference(@RequestBody Map<String, Object> data) {
        try {
            String email = data.get("email").toString();
            String type = data.get("type").toString();
            String value = data.get("value").toString();
            SavedPreference pref = seatSelectionService.savePreference(email, type, value);
            return ResponseEntity.ok(pref);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
