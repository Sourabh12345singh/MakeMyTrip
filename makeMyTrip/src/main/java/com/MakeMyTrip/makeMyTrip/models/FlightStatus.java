package com.MakeMyTrip.makeMyTrip.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "flight_status")
public class FlightStatus {
    @Id
    private String id;
    private String flightId;
    private String status;
    private String delayDuration;
    private String delayReason;
    private String revisedDepartureTime;
    private String revisedArrivalTime;
    private String estimatedArrivalTime;
    private String gate;
    private String lastUpdated;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFlightId() {
        return flightId;
    }

    public void setFlightId(String flightId) {
        this.flightId = flightId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDelayDuration() {
        return delayDuration;
    }

    public void setDelayDuration(String delayDuration) {
        this.delayDuration = delayDuration;
    }

    public String getDelayReason() {
        return delayReason;
    }

    public void setDelayReason(String delayReason) {
        this.delayReason = delayReason;
    }

    public String getRevisedDepartureTime() {
        return revisedDepartureTime;
    }

    public void setRevisedDepartureTime(String revisedDepartureTime) {
        this.revisedDepartureTime = revisedDepartureTime;
    }

    public String getRevisedArrivalTime() {
        return revisedArrivalTime;
    }

    public void setRevisedArrivalTime(String revisedArrivalTime) {
        this.revisedArrivalTime = revisedArrivalTime;
    }

    public String getEstimatedArrivalTime() {
        return estimatedArrivalTime;
    }

    public void setEstimatedArrivalTime(String estimatedArrivalTime) {
        this.estimatedArrivalTime = estimatedArrivalTime;
    }

    public String getGate() {
        return gate;
    }

    public void setGate(String gate) {
        this.gate = gate;
    }

    public String getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(String lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
