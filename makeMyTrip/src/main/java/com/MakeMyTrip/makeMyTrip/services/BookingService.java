package com.MakeMyTrip.makeMyTrip.services;

import com.MakeMyTrip.makeMyTrip.models.Flight;
import com.MakeMyTrip.makeMyTrip.models.FlightSeatMap;
import com.MakeMyTrip.makeMyTrip.models.HotelRoomType;
import com.MakeMyTrip.makeMyTrip.models.TrackedFlight;
import com.MakeMyTrip.makeMyTrip.models.PriceFreeze;
import com.MakeMyTrip.makeMyTrip.models.Users;
//import com.MakeMyTrip.makeMyTrip.models.Users.Booking;  //we can use either
import com.MakeMyTrip.makeMyTrip.repositories.FlightRepository;
import com.MakeMyTrip.makeMyTrip.repositories.FlightSeatMapRepository;
import com.MakeMyTrip.makeMyTrip.repositories.HotelRepository;
import com.MakeMyTrip.makeMyTrip.repositories.HotelRoomTypeRepository;
import com.MakeMyTrip.makeMyTrip.repositories.PriceFreezeRepository;
import com.MakeMyTrip.makeMyTrip.repositories.TrackedFlightRepository;
import com.MakeMyTrip.makeMyTrip.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.springframework.data.mongodb.core.query.Query.query;

@Service
public class BookingService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private FlightRepository flightRepository;
    @Autowired
    private HotelRepository hotelRepository;
    @Autowired
    private TrackedFlightRepository trackedFlightRepository;

    @Autowired
    private PriceFreezeRepository priceFreezeRepository;
    @Autowired
    private FlightSeatMapRepository flightSeatMapRepository;
    @Autowired
    private HotelRoomTypeRepository hotelRoomTypeRepository;
    @Autowired
    private MongoTemplate mongoTemplate;

    public Users.Booking bookFlight(String userEmail, String flightId , int seats , double price) {
        return bookFlight(userEmail, flightId, seats, price, null);
    }

    public Users.Booking bookFlight(String userEmail, String flightId , int seats , double price, List<String> selectedSeats) {
        Optional<Flight> flightOptional = flightRepository.findById(flightId);
        if (flightOptional.isEmpty()) {
            throw new RuntimeException("Flight not found");
        }
        Flight flight = flightOptional.get();
        if (flight.getAvailableSeats() < seats) {
            throw new RuntimeException("Not enough seats available");
        }

        if (!userRepository.existsByEmail(userEmail)) {
            throw new RuntimeException("User not found");
        }

        double finalPrice = price;
        Optional<PriceFreeze> freezeOpt = priceFreezeRepository.findByUserEmailAndFlightIdAndConsumedFalse(userEmail, flightId);
        if (freezeOpt.isPresent()) {
            PriceFreeze freeze = freezeOpt.get();
            if (freeze.getExpiresAt() != null && freeze.getExpiresAt().compareTo(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)) > 0) {
                finalPrice = freeze.getFrozenPrice() * seats;
                freeze.setConsumed(true);
                priceFreezeRepository.save(freeze);
            }
        }

        if (selectedSeats != null && !selectedSeats.isEmpty()) {
            FlightSeatMap seatMap = flightSeatMapRepository.findByFlightId(flightId);
            if (seatMap != null) {
                Set<String> seatSet = new HashSet<>(selectedSeats);
                if (seatSet.size() != selectedSeats.size()) {
                    throw new RuntimeException("Duplicate seat numbers provided");
                }
                for (FlightSeatMap.Seat seat : seatMap.getSeats()) {
                    if (selectedSeats.contains(seat.getSeatNumber())) {
                        if (seat.isBooked()) {
                            throw new RuntimeException("Seat " + seat.getSeatNumber() + " is already booked");
                        }
                        seat.setBooked(true);
                    }
                }
                flightSeatMapRepository.save(seatMap);
            }
        }

        flight.setAvailableSeats(flight.getAvailableSeats() - seats);
        flightRepository.save(flight);

        Users.Booking booking = new Users.Booking();
        booking.setType("Flight");
        booking.setBookingId(flight.getId());
        booking.setDate(LocalDate.now().toString());
        booking.setQuantity(seats);
        booking.setTotalPrice(finalPrice);
        booking.setSelectedSeats(selectedSeats != null ? selectedSeats : new java.util.ArrayList<>());

        // Atomic push to bookings array — avoids race condition overwrites
        var result = mongoTemplate.updateFirst(
            query(Criteria.where("email").is(userEmail)),
            new Update().push("bookings", booking),
            Users.class
        );
        if (result.getModifiedCount() == 0) {
            throw new RuntimeException("Failed to save booking — user not found");
        }

        if (!trackedFlightRepository.existsByUserEmailAndFlightId(userEmail, flightId)) {
            TrackedFlight tf = new TrackedFlight();
            tf.setUserEmail(userEmail);
            tf.setFlightId(flightId);
            tf.setTrackedSince(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            tf.setFromBooking(true);
            trackedFlightRepository.save(tf);
        }

        return booking;
    }

    public Users.Booking bookHotel(String userEmail, String hotelId , int rooms , double price) {
        return bookHotel(userEmail, hotelId, rooms, price, null);
    }

    public Users.Booking bookHotel(String userEmail, String hotelId , int rooms , double price, String roomTypeId) {
        Optional<com.MakeMyTrip.makeMyTrip.models.Hotel> hotelOptional = hotelRepository.findById(hotelId);
        if (hotelOptional.isEmpty()) {
            throw new RuntimeException("Hotel not found");
        }
        com.MakeMyTrip.makeMyTrip.models.Hotel hotel = hotelOptional.get();
        if (hotel.getAvailableRooms() < rooms) {
            throw new RuntimeException("Sorry dawg, i have heart for u, not enough rooms available");
        }

        if (!userRepository.existsByEmail(userEmail)) {
            throw new RuntimeException("User not found");
        }

        Users.Booking booking = new Users.Booking();
        booking.setType("Hotel");
        booking.setBookingId(hotelId);
        booking.setDate(LocalDate.now().toString());
        booking.setQuantity(rooms);
        booking.setTotalPrice(price);

        if (roomTypeId != null && !roomTypeId.isEmpty()) {
            HotelRoomType roomType = hotelRoomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new RuntimeException("Room type not found"));
            if (!roomType.getHotelId().equals(hotelId)) {
                throw new RuntimeException("Room type does not belong to this hotel");
            }
            if (roomType.getAvailable() < rooms) {
                throw new RuntimeException("Not enough rooms of this type available");
            }
            roomType.setAvailable(roomType.getAvailable() - rooms);
            hotelRoomTypeRepository.save(roomType);
            booking.setRoomTypeName(roomType.getName());
        } else {
            hotel.setAvailableRooms(hotel.getAvailableRooms() - rooms);
            hotelRepository.save(hotel);
        }

        // Atomic push to bookings array
        var result = mongoTemplate.updateFirst(
            query(Criteria.where("email").is(userEmail)),
            new Update().push("bookings", booking),
            Users.class
        );
        if (result.getModifiedCount() == 0) {
            throw new RuntimeException("Failed to save booking — user not found");
        }

        return booking;
    }


}
