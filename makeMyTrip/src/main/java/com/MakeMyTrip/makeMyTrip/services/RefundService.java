package com.MakeMyTrip.makeMyTrip.services;

import com.MakeMyTrip.makeMyTrip.models.*;
import com.MakeMyTrip.makeMyTrip.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class RefundService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RefundRepository refundRepository;

    public static final List<String> CANCELLATION_REASONS = Arrays.asList(
        "Changed plans",
        "Found cheaper alternative",
        "Medical emergency",
        "Travel restrictions",
        "Booking error",
        "Other"
    );

    public double calculateRefundPercent(String bookingDate) {
        LocalDate booked = LocalDate.parse(bookingDate);
        long hoursSinceBooking = ChronoUnit.HOURS.between(booked.atStartOfDay(), LocalDateTime.now());
        if (hoursSinceBooking <= 24) return 50.0;
        if (hoursSinceBooking <= 48) return 25.0;
        return 10.0;
    }

    public Refund cancelBooking(String userEmail, String bookingId, String reason) {
        Users user = userRepository.findByEmail(userEmail);
        if (user == null) throw new RuntimeException("User not found");

        Users.Booking booking = null;
        int bookingIndex = -1;
        for (int i = 0; i < user.getBookings().size(); i++) {
            Users.Booking b = user.getBookings().get(i);
            if (b.getBookingId().equals(bookingId) && !b.isCancelled()) {
                booking = b;
                bookingIndex = i;
                break;
            }
        }
        if (booking == null) throw new RuntimeException("Booking not found or already cancelled");

        double refundPercent = calculateRefundPercent(booking.getDate());
        double refundAmount = Math.round((booking.getTotalPrice() * refundPercent / 100.0) * 100.0) / 100.0;
        int qty = booking.getQuantity();
        String bid = booking.getBookingId();

        if ("Flight".equals(booking.getType())) {
            Optional<Flight> flightOpt = flightRepository.findById(bid);
            flightOpt.ifPresent(f -> {
                f.setAvailableSeats(f.getAvailableSeats() + qty);
                flightRepository.save(f);
            });
        } else if ("Hotel".equals(booking.getType())) {
            Optional<Hotel> hotelOpt = hotelRepository.findById(bid);
            hotelOpt.ifPresent(h -> {
                h.setAvailableRooms(h.getAvailableRooms() + qty);
                hotelRepository.save(h);
            });
        }

        Refund refund = new Refund();
        refund.setUserEmail(userEmail);
        refund.setBookingId(bookingId);
        refund.setBookingType(booking.getType());
        refund.setOriginalAmount(booking.getTotalPrice());
        refund.setRefundAmount(refundAmount);
        refund.setRefundPercent(refundPercent);
        refund.setReason(reason);
        refund.setStatus("PENDING");
        refund.setRequestedAt(LocalDateTime.now().toString());
        refund.setExpectedCompletionDate(LocalDateTime.now().plusSeconds(45).toString());
        refundRepository.save(refund);

        booking.setCancelled(true);
        booking.setRefundId(refund.getId());
        user.getBookings().set(bookingIndex, booking);
        userRepository.save(user);

        return refund;
    }

    @Scheduled(fixedRate = 15000)
    public void processRefunds() {
        List<Refund> pendings = refundRepository.findByStatus("PENDING");
        LocalDateTime now = LocalDateTime.now();
        for (Refund r : pendings) {
            if (r.getExpectedCompletionDate() != null) {
                LocalDateTime expected = LocalDateTime.parse(r.getExpectedCompletionDate());
                if (now.isAfter(expected.minusSeconds(30))) {
                    r.setStatus("PROCESSED");
                    r.setProcessedAt(now.toString());
                    refundRepository.save(r);
                }
            }
        }

        List<Refund> processeds = refundRepository.findByStatus("PROCESSED");
        for (Refund r : processeds) {
            if (r.getProcessedAt() != null) {
                LocalDateTime processedAt = LocalDateTime.parse(r.getProcessedAt());
                if (now.isAfter(processedAt.plusSeconds(15))) {
                    r.setStatus("COMPLETED");
                    refundRepository.save(r);
                }
            }
        }
    }

    public List<Refund> getRefundsByUser(String userEmail) {
        return refundRepository.findByUserEmailOrderByRequestedAtDesc(userEmail);
    }

    public List<String> getReasons() {
        return CANCELLATION_REASONS;
    }
}
