package com.MakeMyTrip.makeMyTrip.controllers;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*") // Allow requests from any origin
public class RootController {

    @GetMapping("/")
    public String root() {
        return "Welcome to Home, dawgs";

    }

    @GetMapping("/flight")
    public String flight() {
        return "Welcome to Flight, dawgs";
    }

    @GetMapping("/hotel")
    public String hotel() {
        return "Welcome to Hotel, dawgs";
    }

    @GetMapping("/api/health")
    public java.util.Map<String, Object> health() {
        return java.util.Map.of(
            "status", "UP",
            "timestamp", java.time.LocalDateTime.now().toString(),
            "service", "makeMyTrip"
        );
    }

}
