package com.MakeMyTrip.makeMyTrip.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "price_freezes")
public class PriceFreeze {
    @Id
    private String id;
    private String userEmail;
    private String flightId;
    private double frozenPrice;
    private String expiresAt;
    private String createdAt;
    private boolean consumed;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getFlightId() { return flightId; }
    public void setFlightId(String flightId) { this.flightId = flightId; }
    public double getFrozenPrice() { return frozenPrice; }
    public void setFrozenPrice(double frozenPrice) { this.frozenPrice = frozenPrice; }
    public String getExpiresAt() { return expiresAt; }
    public void setExpiresAt(String expiresAt) { this.expiresAt = expiresAt; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public boolean isConsumed() { return consumed; }
    public void setConsumed(boolean consumed) { this.consumed = consumed; }
}
