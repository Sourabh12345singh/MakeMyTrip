package com.MakeMyTrip.makeMyTrip.controllers;

import com.MakeMyTrip.makeMyTrip.models.Refund;
import com.MakeMyTrip.makeMyTrip.services.RefundService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class RefundController {

    @Autowired
    private RefundService refundService;

    @GetMapping("/api/refunds/reasons")
    public ResponseEntity<List<String>> getReasons() {
        return ResponseEntity.ok(refundService.getReasons());
    }

    @PostMapping("/api/refunds/cancel")
    public ResponseEntity<?> cancelBooking(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String bookingId = body.get("bookingId");
        String reason = body.get("reason");

        if (email == null || bookingId == null || reason == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "email, bookingId, and reason are required"));
        }

        try {
            Refund refund = refundService.cancelBooking(email, bookingId, reason);
            return ResponseEntity.ok(refund);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/api/refunds/{email}")
    public ResponseEntity<List<Refund>> getRefunds(@PathVariable String email) {
        return ResponseEntity.ok(refundService.getRefundsByUser(email));
    }
}
