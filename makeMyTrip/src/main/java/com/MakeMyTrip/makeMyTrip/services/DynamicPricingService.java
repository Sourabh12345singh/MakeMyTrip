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

    @Scheduled(fixedRate = 30000)
    public void updatePrices() {
        List<Flight> flights = flightRepository.findAll();
        int month = LocalDate.now().getMonthValue();
        boolean isHolidaySeason = month == 12 || month == 1 || month == 5 || month == 6;

        for (Flight flight : flights) {
            double basePrice = flight.getBasePrice() > 0 ? flight.getBasePrice() : flight.getPrice();
            double oldPrice = flight.getPrice();

            double demandFactor = 1.0 + (1.0 - (double) flight.getAvailableSeats() / 150.0) * 0.5;
            demandFactor = Math.max(1.0, Math.min(1.5, demandFactor));

            double seasonalFactor = isHolidaySeason ? 1.2 : 1.0;

            String[] depParts = flight.getDepartureTime().split(":");
            LocalTime departureTime = LocalTime.of(Integer.parseInt(depParts[0]), Integer.parseInt(depParts[1]));
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime departureDt = LocalDateTime.of(now.toLocalDate(), departureTime);
            if (departureDt.isBefore(now)) {
                departureDt = departureDt.plusDays(1);
            }
            long hoursUntilDeparture = Duration.between(now, departureDt).toHours();
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

            double newPrice = basePrice * demandFactor * seasonalFactor * timeFactor;
            newPrice = Math.round(newPrice / 10.0) * 10.0;

            if (Math.abs(newPrice - oldPrice) < 1.0) {
                continue;
            }

            flight.setPrice(newPrice);
            flightRepository.save(flight);

            String reason;
            String description;
            if (seasonalFactor > 1.0 && demandFactor > 1.2) {
                reason = "DEMAND_SEASONAL";
                description = "Holiday season + demand surge";
            } else if (seasonalFactor > 1.0) {
                reason = "SEASONAL";
                description = "Holiday season premium";
            } else if (timeFactor > 1.0) {
                reason = "TIME_TO_DEPARTURE";
                description = timeDesc;
            } else if (demandFactor > 1.1) {
                reason = "DEMAND";
                description = String.format("Demand surge (%.0f%% seats booked)", (1 - (double) flight.getAvailableSeats() / 150.0) * 100);
            } else {
                reason = "DEMAND";
                description = "Price adjusted to demand";
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
