package com.MakeMyTrip.makeMyTrip.controllers;

import com.MakeMyTrip.makeMyTrip.models.Flight;
import com.MakeMyTrip.makeMyTrip.models.FlightStatus;
import com.MakeMyTrip.makeMyTrip.models.PushSubscription;
import com.MakeMyTrip.makeMyTrip.models.TrackedFlight;
import com.MakeMyTrip.makeMyTrip.repositories.FlightRepository;
import com.MakeMyTrip.makeMyTrip.repositories.FlightStatusRepository;
import com.MakeMyTrip.makeMyTrip.repositories.PushSubscriptionRepository;
import com.MakeMyTrip.makeMyTrip.repositories.TrackedFlightRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
public class FlightStatusController {

    @Autowired
    private TrackedFlightRepository trackedFlightRepository;

    @Autowired
    private FlightStatusRepository flightStatusRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private PushSubscriptionRepository pushSubscriptionRepository;

    @PostMapping("/api/flights/track")
    public ResponseEntity<?> trackFlight(@RequestBody Map<String, String> body) {
        String userEmail = body.get("email");
        String flightId = body.get("flightId");

        if (userEmail == null || flightId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "email and flightId are required"));
        }

        if (trackedFlightRepository.existsByUserEmailAndFlightId(userEmail, flightId)) {
            return ResponseEntity.ok(Map.of("message", "Already tracking this flight"));
        }

        Optional<Flight> flight = flightRepository.findById(flightId);
        if (flight.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Flight not found"));
        }

        TrackedFlight tf = new TrackedFlight();
        tf.setUserEmail(userEmail);
        tf.setFlightId(flightId);
        tf.setTrackedSince(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        trackedFlightRepository.save(tf);

        return ResponseEntity.ok(Map.of("message", "Flight tracking started"));
    }

    @GetMapping("/api/flights/tracked")
    public ResponseEntity<?> getTrackedFlights(@RequestParam String email) {
        List<TrackedFlight> tracked = trackedFlightRepository.findByUserEmail(email);

        List<Map<String, Object>> result = new ArrayList<>();
        for (TrackedFlight tf : tracked) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("id", tf.getId());
            entry.put("flightId", tf.getFlightId());
            entry.put("trackedSince", tf.getTrackedSince());

            Optional<Flight> flight = flightRepository.findById(tf.getFlightId());
            flight.ifPresent(f -> entry.put("flight", f));

            Optional<FlightStatus> status = flightStatusRepository.findTopByFlightIdOrderByLastUpdatedDesc(tf.getFlightId());
            status.ifPresent(s -> entry.put("status", s));

            result.add(entry);
        }

        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/api/flights/tracked/{id}")
    public ResponseEntity<?> untrackFlight(@PathVariable String id) {
        Optional<TrackedFlight> tf = trackedFlightRepository.findById(id);
        if (tf.isPresent()) {
            if (tf.get().isFromBooking()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cannot untrack a flight that was automatically tracked from booking"));
            }
            trackedFlightRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Flight untracked"));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/api/flights/{id}/status")
    public ResponseEntity<?> getFlightStatus(@PathVariable String id) {
        if (!flightRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        Optional<FlightStatus> status = flightStatusRepository.findTopByFlightIdOrderByLastUpdatedDesc(id);
        if (status.isPresent()) {
            return ResponseEntity.ok(status.get());
        }

        FlightStatus initial = new FlightStatus();
        initial.setFlightId(id);
        initial.setStatus("ON_TIME");
        initial.setLastUpdated(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        Optional<Flight> flight = flightRepository.findById(id);
        flight.ifPresent(f -> initial.setEstimatedArrivalTime(f.getArrivalTime()));

        flightStatusRepository.save(initial);
        return ResponseEntity.ok(initial);
    }

    @PostMapping("/api/push/subscribe")
    public ResponseEntity<?> subscribePush(@RequestBody Map<String, String> body) {
        String userEmail = body.get("email");
        String endpoint = body.get("endpoint");
        String p256dh = body.get("p256dh");
        String auth = body.get("auth");

        if (userEmail == null || endpoint == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "email and endpoint are required"));
        }

        Optional<PushSubscription> existing = pushSubscriptionRepository.findByEndpoint(endpoint);
        if (existing.isPresent()) {
            return ResponseEntity.ok(Map.of("message", "Already subscribed"));
        }

        PushSubscription sub = new PushSubscription();
        sub.setUserEmail(userEmail);
        sub.setEndpoint(endpoint);
        sub.setP256dh(p256dh);
        sub.setAuth(auth);
        pushSubscriptionRepository.save(sub);

        return ResponseEntity.ok(Map.of("message", "Push subscription saved"));
    }

    @PostMapping("/api/push/unsubscribe")
    public ResponseEntity<?> unsubscribePush(@RequestBody Map<String, String> body) {
        String endpoint = body.get("endpoint");
        if (endpoint == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "endpoint is required"));
        }

        Optional<PushSubscription> existing = pushSubscriptionRepository.findByEndpoint(endpoint);
        existing.ifPresent(sub -> pushSubscriptionRepository.deleteById(sub.getId()));
        return ResponseEntity.ok(Map.of("message", "Unsubscribed"));
    }
}
