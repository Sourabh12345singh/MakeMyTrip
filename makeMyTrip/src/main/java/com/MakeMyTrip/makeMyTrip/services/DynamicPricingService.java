package com.MakeMyTrip.makeMyTrip.services;

import com.MakeMyTrip.makeMyTrip.models.Flight;
import com.MakeMyTrip.makeMyTrip.models.PriceHistory;
import com.MakeMyTrip.makeMyTrip.repositories.FlightRepository;
import com.MakeMyTrip.makeMyTrip.repositories.PriceHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DynamicPricingService {

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private PriceHistoryRepository priceHistoryRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private final Map<String, Double> lastPublishedPrice = new HashMap<>();

    // Mock surge: full up + down cycle in 5 minutes (10 ticks up, 10 ticks down at 30s each)
    private static final long SURGE_CYCLE_MS = 5 * 60 * 1000;
    // Absolute max price for the simulation
    private static final double MAX_PRICE = 200000.0;

    @Scheduled(fixedRate = 5000) // Changed to 5s for fast demo experience
    public void updatePrices() {
        List<Flight> flights = flightRepository.findAll();
        int month = LocalDate.now().getMonthValue();
        boolean isHolidaySeason = month == 12 || month == 1 || month == 5 || month == 6;

        for (Flight flight : flights) {
            double basePrice = flight.getBasePrice() > 0 ? flight.getBasePrice() : flight.getPrice();
            double oldPrice = flight.getPrice();

            // --- Mock surge cycle: oscillates from 1.0 up to maxSurge and back to 1.0 ---
            long now = System.currentTimeMillis();
            double phase = (now % SURGE_CYCLE_MS) / (double) SURGE_CYCLE_MS;
            double maxSurge = Math.min(50.0, MAX_PRICE / basePrice);
            double mockFactor = 1.0 + (maxSurge - 1.0) * Math.sin(Math.PI * phase);

            // --- Real demand factor (based on seat availability) ---
            double demandFactor = 1.0 + (1.0 - (double) flight.getAvailableSeats() / 150.0) * 0.5;
            demandFactor = Math.max(1.0, Math.min(1.5, demandFactor));

            // --- Seasonal factor ---
            double seasonalFactor = isHolidaySeason ? 1.2 : 1.0;

            // --- Time-to-departure factor ---
            String[] depParts = flight.getDepartureTime().split(":");
            LocalTime departureTime = LocalTime.of(Integer.parseInt(depParts[0]), Integer.parseInt(depParts[1]));
            LocalDateTime departureDt = LocalDateTime.of(LocalDateTime.now().toLocalDate(), departureTime);
            if (departureDt.isBefore(LocalDateTime.now())) {
                departureDt = departureDt.plusDays(1);
            }
            long hoursUntilDeparture = Duration.between(LocalDateTime.now(), departureDt).toHours();
            double timeFactor;
            String timeDesc;
            if (hoursUntilDeparture < 48) {
                timeFactor = 1.15;
                timeDesc = "15% surcharge (<48h to departure)";
            } else if (hoursUntilDeparture < 168) {
                timeFactor = 1.05;
                timeDesc = "5% surcharge (<7 days to departure)";
            } else {
                timeFactor = 1.0;
                timeDesc = "No time surcharge";
            }

            // Combined price: mock surge is the dominant driver, demand/season/time add realistic noise
            double newPrice = basePrice * mockFactor * (0.8 + 0.2 * demandFactor * seasonalFactor * timeFactor);
            newPrice = Math.min(MAX_PRICE, newPrice);
            newPrice = Math.round(newPrice / 10.0) * 10.0;

            if (Math.abs(newPrice - oldPrice) < 1.0) {
                continue;
            }

            flight.setPrice(newPrice);
            flightRepository.save(flight);

            // --- Determine reason and description ---
            String reason;
            String description;
            double surgeProgress = (mockFactor - 1.0) / (maxSurge - 1.0);

            boolean isRising = phase < 0.5;
            if (surgeProgress > 0.95) {
                reason = "MOCK_PEAK";
                description = String.format("Peak surge — ₹%.0f", newPrice);
            } else if (isRising && surgeProgress > 0.1) {
                reason = "MOCK_SURGE_UP";
                description = String.format("Mock surge rising — %.0f%% toward ₹%.0f", surgeProgress * 100, MAX_PRICE);
            } else if (isRising) {
                reason = "MOCK_SURGE_START";
                description = "Mock surge starting from base price";
            } else if (surgeProgress > 0.1) {
                reason = "MOCK_SURGE_DOWN";
                description = String.format("Mock surge correcting — %.0f%% back to base price", (1 - surgeProgress) * 100);
            } else {
                reason = "MOCK_BASE";
                description = "Price returned to base level";
            }

            String extraFactors = "";
            if (seasonalFactor > 1.0) extraFactors += "Holiday season ";
            if (timeFactor > 1.0) extraFactors += timeDesc + " ";
            if (demandFactor > 1.1) extraFactors += String.format("Demand (%.0f%% booked) ", (1 - (double) flight.getAvailableSeats() / 150.0) * 100);
            if (!extraFactors.isEmpty()) {
                description += " | " + extraFactors.trim();
            }

            PriceHistory history = new PriceHistory();
            history.setFlightId(flight.getId());
            history.setOldPrice(oldPrice);
            history.setNewPrice(newPrice);
            history.setReason(reason);
            history.setDescription(description);
            history.setTimestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            priceHistoryRepository.save(history);

            Map<String, Object> priceUpdate = new HashMap<>();
            priceUpdate.put("flightId", flight.getId());
            priceUpdate.put("oldPrice", oldPrice);
            priceUpdate.put("newPrice", newPrice);
            priceUpdate.put("basePrice", basePrice);
            priceUpdate.put("reason", reason);
            priceUpdate.put("description", description);
            priceUpdate.put("lastUpdated", history.getTimestamp());
            messagingTemplate.convertAndSend("/topic/price/" + flight.getId(), (Object) priceUpdate);

            lastPublishedPrice.put(flight.getId(), newPrice);
        }
    }
}
