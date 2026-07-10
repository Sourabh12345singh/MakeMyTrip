package com.MakeMyTrip.makeMyTrip.services;

import com.MakeMyTrip.makeMyTrip.models.Flight;
import com.MakeMyTrip.makeMyTrip.models.FlightStatus;
import com.MakeMyTrip.makeMyTrip.models.PushSubscription;
import com.MakeMyTrip.makeMyTrip.models.TrackedFlight;
import com.MakeMyTrip.makeMyTrip.repositories.PushSubscriptionRepository;
import com.MakeMyTrip.makeMyTrip.repositories.TrackedFlightRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PushNotificationService {

    @Autowired
    private PushSubscriptionRepository pushSubscriptionRepository;

    @Autowired
    private TrackedFlightRepository trackedFlightRepository;

    public void sendStatusChangeNotification(Flight flight, FlightStatus newStatus, String previousStatus) {
        List<TrackedFlight> trackers = trackedFlightRepository.findAllByFlightId(flight.getId());

        for (TrackedFlight tracker : trackers) {
            List<PushSubscription> subs = pushSubscriptionRepository.findByUserEmail(tracker.getUserEmail());

            for (PushSubscription sub : subs) {
                String title = "Flight " + flight.getFlightName() + " Status Update";
                String body = buildNotificationBody(flight, newStatus, previousStatus);
                sendPushMessage(sub, title, body);
            }
        }
    }

    private String buildNotificationBody(Flight flight, FlightStatus status, String previousStatus) {
        String route = flight.getFrom() + " → " + flight.getTo();
        String statusText = status.getStatus().replace("_", " ");

        StringBuilder sb = new StringBuilder();
        sb.append(flight.getFlightName()).append(" (").append(route).append(")\n");
        sb.append("Status: ").append(statusText);

        if ("DELAYED".equals(status.getStatus())) {
            sb.append("\nDelay: ").append(status.getDelayDuration());
            sb.append("\nReason: ").append(status.getDelayReason());
            if (status.getRevisedDepartureTime() != null) {
                sb.append("\nRevised Departure: ").append(status.getRevisedDepartureTime());
            }
        }

        if ("BOARDING".equals(status.getStatus())) {
            sb.append("\nGate: ").append(status.getGate());
            sb.append("\nPlease proceed to gate for boarding.");
        }

        return sb.toString();
    }

    private void sendPushMessage(PushSubscription subscription, String title, String body) {
        try {
            java.net.URL url = new java.net.URL(subscription.getEndpoint());
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("TTL", "86400");
            conn.setDoOutput(true);

            String payload = String.format(
                "{\"title\":\"%s\",\"body\":\"%s\"}",
                title.replace("\"", "\\\""),
                body.replace("\"", "\\\"").replace("\n", "\\n")
            );

            try (java.io.OutputStream os = conn.getOutputStream()) {
                os.write(payload.getBytes("UTF-8"));
                os.flush();
            }

            int responseCode = conn.getResponseCode();
            if (responseCode >= 400) {
                System.err.println("Push notification failed: " + responseCode + " for endpoint: " + subscription.getEndpoint());
            }

            conn.disconnect();
        } catch (Exception e) {
            System.err.println("Error sending push notification: " + e.getMessage());
        }
    }
}
