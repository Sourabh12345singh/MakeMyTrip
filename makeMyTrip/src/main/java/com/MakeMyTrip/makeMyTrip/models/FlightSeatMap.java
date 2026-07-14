package com.MakeMyTrip.makeMyTrip.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "flight_seat_maps")
public class FlightSeatMap {
    @Id
    private String _id;
    private String flightId;
    private int rows;
    private int seatsPerRow;
    private List<Seat> seats;

    public static class Seat {
        private String seatNumber;
        private String type;
        private double pricePremium;
        private boolean booked;

        public Seat() {}

        public Seat(String seatNumber, String type, double pricePremium, boolean booked) {
            this.seatNumber = seatNumber;
            this.type = type;
            this.pricePremium = pricePremium;
            this.booked = booked;
        }

        public String getSeatNumber() { return seatNumber; }
        public void setSeatNumber(String seatNumber) { this.seatNumber = seatNumber; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public double getPricePremium() { return pricePremium; }
        public void setPricePremium(double pricePremium) { this.pricePremium = pricePremium; }
        public boolean isBooked() { return booked; }
        public void setBooked(boolean booked) { this.booked = booked; }
    }

    public String getId() { return _id; }
    public void setId(String id) { this._id = id; }
    public String getFlightId() { return flightId; }
    public void setFlightId(String flightId) { this.flightId = flightId; }
    public int getRows() { return rows; }
    public void setRows(int rows) { this.rows = rows; }
    public int getSeatsPerRow() { return seatsPerRow; }
    public void setSeatsPerRow(int seatsPerRow) { this.seatsPerRow = seatsPerRow; }
    public List<Seat> getSeats() { return seats; }
    public void setSeats(List<Seat> seats) { this.seats = seats; }
}
