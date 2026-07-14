package com.MakeMyTrip.makeMyTrip.controllers;

import com.MakeMyTrip.makeMyTrip.models.Flight;
import com.MakeMyTrip.makeMyTrip.models.PriceFreeze;
import com.MakeMyTrip.makeMyTrip.models.PriceHistory;
import com.MakeMyTrip.makeMyTrip.models.TrackedFlight;
import com.MakeMyTrip.makeMyTrip.repositories.FlightRepository;
import com.MakeMyTrip.makeMyTrip.repositories.PriceFreezeRepository;
import com.MakeMyTrip.makeMyTrip.repositories.PriceHistoryRepository;
import com.MakeMyTrip.makeMyTrip.repositories.TrackedFlightRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
public class PricingController {

    @Autowired
    private PriceHistoryRepository priceHistoryRepository;

    @Autowired
    private PriceFreezeRepository priceFreezeRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private TrackedFlightRepository trackedFlightRepository;

    @GetMapping("/api/pricing/history/{flightId}")
    public ResponseEntity<?> getPriceHistory(@PathVariable String flightId) {
        List<PriceHistory> history = priceHistoryRepository.findByFlightIdOrderByTimestampAsc(flightId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/api/pricing/current/{flightId}")
    public ResponseEntity<?> getCurrentPrice(@PathVariable String flightId) {
        Optional<Flight> flightOpt = flightRepository.findById(flightId);
        if (flightOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Flight flight = flightOpt.get();
        Map<String, Object> response = new HashMap<>();
        response.put("flightId", flight.getId());
        response.put("currentPrice", flight.getPrice());
        response.put("basePrice", flight.getBasePrice() > 0 ? flight.getBasePrice() : flight.getPrice());
        response.put("availableSeats", flight.getAvailableSeats());
        double surgePercent = ((flight.getPrice() / (flight.getBasePrice() > 0 ? flight.getBasePrice() : flight.getPrice())) - 1) * 100;
        response.put("surgePercent", Math.round(surgePercent * 10.0) / 10.0);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/pricing/freeze")
    public ResponseEntity<?> freezePrice(@RequestBody Map<String, String> body) {
        String userEmail = body.get("email");
        String flightId = body.get("flightId");
        if (userEmail == null || flightId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "email and flightId required"));
        }

        Optional<PriceFreeze> existing = priceFreezeRepository.findByUserEmailAndFlightIdAndConsumedFalse(userEmail, flightId);
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Price already frozen for this flight"));
        }

        Optional<Flight> flightOpt = flightRepository.findById(flightId);
        if (flightOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        PriceFreeze freeze = new PriceFreeze();
        freeze.setUserEmail(userEmail);
        freeze.setFlightId(flightId);
        freeze.setFrozenPrice(flightOpt.get().getPrice());
        freeze.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        freeze.setExpiresAt(LocalDateTime.now().plusHours(24).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        freeze.setConsumed(false);
        priceFreezeRepository.save(freeze);

        if (!trackedFlightRepository.existsByUserEmailAndFlightId(userEmail, flightId)) {
            TrackedFlight tf = new TrackedFlight();
            tf.setUserEmail(userEmail);
            tf.setFlightId(flightId);
            tf.setTrackedSince(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            tf.setFromBooking(false);
            trackedFlightRepository.save(tf);
        }

        return ResponseEntity.ok(freeze);
    }

    @GetMapping("/api/pricing/freeze/{email}")
    public ResponseEntity<?> getActiveFreezes(@PathVariable String email) {
        List<PriceFreeze> freezes = priceFreezeRepository.findByUserEmailAndConsumedFalse(email);
        List<Map<String, Object>> result = new ArrayList<>();
        for (PriceFreeze f : freezes) {
            if (f.getExpiresAt() != null && f.getExpiresAt().compareTo(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)) < 0) {
                f.setConsumed(true);
                priceFreezeRepository.save(f);
                continue;
            }
            Map<String, Object> item = new HashMap<>();
            item.put("id", f.getId());
            item.put("flightId", f.getFlightId());
            item.put("frozenPrice", f.getFrozenPrice());
            item.put("expiresAt", f.getExpiresAt());
            item.put("createdAt", f.getCreatedAt());
            Optional<Flight> flightOpt = flightRepository.findById(f.getFlightId());
            item.put("flightName", flightOpt.map(Flight::getFlightName).orElse("Unknown"));
            result.add(item);
        }
        return ResponseEntity.ok(result);
    }
}
