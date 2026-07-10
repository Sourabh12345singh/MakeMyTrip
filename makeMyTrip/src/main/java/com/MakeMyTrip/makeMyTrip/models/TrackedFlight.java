package com.MakeMyTrip.makeMyTrip.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "tracked_flight")
public class TrackedFlight {
    @Id
    private String id;
    private String userEmail;
    private String flightId;
    private String trackedSince;
    private boolean fromBooking;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getFlightId() {
        return flightId;
    }

    public void setFlightId(String flightId) {
        this.flightId = flightId;
    }

    public String getTrackedSince() {
        return trackedSince;
    }

    public void setTrackedSince(String trackedSince) {
        this.trackedSince = trackedSince;
    }

    public boolean isFromBooking() {
        return fromBooking;
    }

    public void setFromBooking(boolean fromBooking) {
        this.fromBooking = fromBooking;
    }
}
