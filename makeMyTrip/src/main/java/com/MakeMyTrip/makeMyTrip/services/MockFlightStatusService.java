package com.MakeMyTrip.makeMyTrip.services;

import com.MakeMyTrip.makeMyTrip.models.Flight;
import com.MakeMyTrip.makeMyTrip.models.FlightStatus;
import com.MakeMyTrip.makeMyTrip.models.TrackedFlight;
import com.MakeMyTrip.makeMyTrip.repositories.FlightRepository;
import com.MakeMyTrip.makeMyTrip.repositories.FlightStatusRepository;
import com.MakeMyTrip.makeMyTrip.repositories.TrackedFlightRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MockFlightStatusService {

    @Autowired
    private TrackedFlightRepository trackedFlightRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private FlightStatusRepository flightStatusRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private PushNotificationService pushNotificationService;

    private static final List<String> DELAY_REASONS = Arrays.asList(
        "Weather conditions at origin",
        "Technical maintenance required",
        "Air traffic congestion",
        "Late arrival of incoming aircraft",
        "Crew scheduling adjustment",
        "Security checks in progress",
        "Operational requirements",
        "Runway maintenance"
    );

    private static final List<String> GATES = Arrays.asList("A1", "A2", "B1", "B2", "B3", "C1", "C2", "D1", "D2", "E1");

    private static final List<String> STATUSES = Arrays.asList("ON_TIME", "DELAYED", "BOARDING", "DEPARTED", "LANDED");

    private static final List<String> DELAY_DURATIONS = Arrays.asList("15m", "30m", "45m", "1h", "1h 30m", "2h", "2h 30m", "3h");

    private final Map<String, String> flightCurrentStatus = new ConcurrentHashMap<>();
    private final Map<String, Integer> flightStatusCounter = new ConcurrentHashMap<>();
    private final Map<String, String> flightCurrentGate = new ConcurrentHashMap<>();

    @Scheduled(fixedRate = 5000) // Changed to 5s for fast demo experience
    public void simulateFlightUpdates() {
        List<TrackedFlight> trackedFlights = trackedFlightRepository.findAll();

        for (TrackedFlight tracked : trackedFlights) {
            String flightId = tracked.getFlightId();

            Optional<Flight> flightOpt = flightRepository.findById(flightId);
            if (flightOpt.isEmpty()) continue;

            Flight flight = flightOpt.get();

            FlightStatus status = generateMockStatus(flight);

            flightStatusRepository.save(status);

            messagingTemplate.convertAndSend("/topic/flight/" + flightId, status);

            String prevStatus = flightCurrentStatus.get(flightId);
            if (prevStatus != null && !prevStatus.equals(status.getStatus())) {
                if (isCriticalChange(status.getStatus())) {
                    pushNotificationService.sendStatusChangeNotification(flight, status, prevStatus);
                }
            }

            flightCurrentStatus.put(flightId, status.getStatus());
        }
    }

    private FlightStatus generateMockStatus(Flight flight) {
        FlightStatus status = new FlightStatus();
        status.setFlightId(flight.getId());
        status.setLastUpdated(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        String currentStatus = flightCurrentStatus.getOrDefault(flight.getId(), "ON_TIME");
        int counter = flightStatusCounter.getOrDefault(flight.getId(), 0);

        String newStatus;
        if ("ON_TIME".equals(currentStatus) && counter >= 1) {
            newStatus = Math.random() < 0.4 ? "DELAYED" : "BOARDING";
        } else if ("DELAYED".equals(currentStatus) && counter >= 1) {
            newStatus = Math.random() < 0.4 ? "BOARDING" : "DELAYED";
        } else if ("BOARDING".equals(currentStatus) && counter >= 1) {
            newStatus = Math.random() < 0.6 ? "DEPARTED" : "BOARDING";
        } else if ("DEPARTED".equals(currentStatus) && counter >= 2) {
            newStatus = Math.random() < 0.7 ? "LANDED" : "DEPARTED";
        } else if ("LANDED".equals(currentStatus)) {
            newStatus = "LANDED";
        } else {
            newStatus = currentStatus;
        }
        if ("ON_TIME".equals(currentStatus) && newStatus.equals(currentStatus) && Math.random() < 0.2) {
            newStatus = Math.random() < 0.5 ? "DELAYED" : "BOARDING";
        }

        status.setStatus(newStatus);
        flightCurrentStatus.put(flight.getId(), newStatus);
        flightStatusCounter.put(flight.getId(), counter + 1);

        String gate = flightCurrentGate.computeIfAbsent(flight.getId(), k -> GATES.get(new Random().nextInt(GATES.size())));
        if (new Random().nextDouble() < 0.1) {
            gate = GATES.get(new Random().nextInt(GATES.size()));
            flightCurrentGate.put(flight.getId(), gate);
        }
        status.setGate(gate);

        if ("DELAYED".equals(newStatus)) {
            String delay = DELAY_DURATIONS.get(new Random().nextInt(DELAY_DURATIONS.size()));
            status.setDelayDuration(delay);
            status.setDelayReason(DELAY_REASONS.get(new Random().nextInt(DELAY_REASONS.size())));

            String[] depParts = flight.getDepartureTime().split(":");
            String[] arrParts = flight.getArrivalTime().split(":");

            int depH = Integer.parseInt(depParts[0]);
            int depM = Integer.parseInt(depParts[1]);
            int delayMin = parseDelayToMinutes(delay);
            depM += delayMin;
            depH += depM / 60;
            depM = depM % 60;
            if (depH >= 24) depH -= 24;

            int arrH = Integer.parseInt(arrParts[0]);
            int arrM = Integer.parseInt(arrParts[1]);
            arrM += delayMin;
            arrH += arrM / 60;
            arrM = arrM % 60;
            if (arrH >= 24) arrH -= 24;

            status.setRevisedDepartureTime(String.format("%02d:%02d", depH, depM));
            status.setRevisedArrivalTime(String.format("%02d:%02d", arrH, arrM));
        }

        if ("ON_TIME".equals(newStatus) || "BOARDING".equals(newStatus) || "DEPARTED".equals(newStatus)) {
            status.setEstimatedArrivalTime(flight.getArrivalTime());
        } else if ("DELAYED".equals(newStatus) && status.getRevisedArrivalTime() != null) {
            status.setEstimatedArrivalTime(status.getRevisedArrivalTime());
        } else if ("LANDED".equals(newStatus)) {
            status.setEstimatedArrivalTime("Landed");
        }

        return status;
    }

    private int parseDelayToMinutes(String delay) {
        int total = 0;
        if (delay.contains("h")) {
            String[] parts = delay.split("h");
            total += Integer.parseInt(parts[0].trim()) * 60;
            if (parts.length > 1 && parts[1].contains("m")) {
                total += Integer.parseInt(parts[1].replace("m", "").trim());
            }
        } else if (delay.contains("m")) {
            total += Integer.parseInt(delay.replace("m", "").trim());
        }
        return total;
    }

    private boolean isCriticalChange(String newStatus) {
        return "DELAYED".equals(newStatus) || "BOARDING".equals(newStatus);
    }
}
