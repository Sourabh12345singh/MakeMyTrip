package com.MakeMyTrip.makeMyTrip.controllers;

import com.MakeMyTrip.makeMyTrip.models.Flight;
import com.MakeMyTrip.makeMyTrip.repositories.FlightRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class FlightController {

    @Autowired
    private FlightRepository flightRepository;

    @GetMapping("/flights")
    public List<Flight> getAllFlights() {
        return flightRepository.findAll();
    }

    @GetMapping("/flights/{id}")
    public ResponseEntity<Flight> getFlightById(@PathVariable String id) {
        Optional<Flight> flight = flightRepository.findById(id);
        if (flight.isPresent()) {
            return ResponseEntity.ok(flight.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/admin/flights")
    public Flight createFlight(@RequestBody Flight flight) {
        return flightRepository.save(flight);
    }

    @PutMapping("/admin/flights/{id}")
    public ResponseEntity<Flight> updateFlight(@PathVariable String id, @RequestBody Flight updatedFlight) {
        Optional<Flight> existingOpt = flightRepository.findById(id);
        if (existingOpt.isPresent()) {
            Flight existing = existingOpt.get();
            existing.setFlightName(updatedFlight.getFlightName());
            existing.setFrom(updatedFlight.getFrom());
            existing.setTo(updatedFlight.getTo());
            existing.setDepartureTime(updatedFlight.getDepartureTime());
            existing.setArrivalTime(updatedFlight.getArrivalTime());
            existing.setPrice(updatedFlight.getPrice());
            existing.setAvailableSeats(updatedFlight.getAvailableSeats());
            return ResponseEntity.ok(flightRepository.save(existing));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/admin/flights/{id}")
    public ResponseEntity<Void> deleteFlight(@PathVariable String id) {
        Optional<Flight> flight = flightRepository.findById(id);
        if (flight.isPresent()) {
            flightRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
