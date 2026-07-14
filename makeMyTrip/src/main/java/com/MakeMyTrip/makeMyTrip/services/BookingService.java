package com.MakeMyTrip.makeMyTrip.services;

import com.MakeMyTrip.makeMyTrip.models.Flight;
import com.MakeMyTrip.makeMyTrip.models.TrackedFlight;
import com.MakeMyTrip.makeMyTrip.models.PriceFreeze;
import com.MakeMyTrip.makeMyTrip.models.Users;
//import com.MakeMyTrip.makeMyTrip.models.Users.Booking;  //we can use either
import com.MakeMyTrip.makeMyTrip.repositories.FlightRepository;
import com.MakeMyTrip.makeMyTrip.repositories.HotelRepository;
import com.MakeMyTrip.makeMyTrip.repositories.PriceFreezeRepository;
import com.MakeMyTrip.makeMyTrip.repositories.TrackedFlightRepository;
import com.MakeMyTrip.makeMyTrip.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

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

    public Users.Booking bookFlight(String userEmail, String flightId , int seats , double price) {
        Optional<Users> userOptional = Optional.ofNullable(userRepository.findByEmail(userEmail));
        Optional<Flight> flightOptional = flightRepository.findById(flightId);
        if( userOptional.isPresent() && flightOptional.isPresent()){
            Users user = userOptional.get();
            Flight flight = flightOptional.get();
            if( flight.getAvailableSeats() < seats){
                throw new RuntimeException("Not enough seats available");
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

            flight.setAvailableSeats(flight.getAvailableSeats() - seats);
            flightRepository.save(flight);
            Users.Booking booking = new Users.Booking();
            booking.setType("Flight");
            booking.setBookingId(flight.getId());
            booking.setDate(LocalDate.now().toString());
            booking.setQuantity(seats);
            booking.setTotalPrice(finalPrice);
            user.getBookings().add(booking);
            userRepository.save(user);

            if (!trackedFlightRepository.existsByUserEmailAndFlightId(userEmail, flightId)) {
                TrackedFlight tf = new TrackedFlight();
                tf.setUserEmail(userEmail);
                tf.setFlightId(flightId);
                tf.setTrackedSince(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
                tf.setFromBooking(true);
                trackedFlightRepository.save(tf);
            }

            return booking;

        }else{
            throw new RuntimeException("User or Flight not found");
        }

    }

    public Users.Booking bookHotel(String userEmail, String hotelId , int rooms , double price) {
        Optional<Users> userOptional = Optional.ofNullable(userRepository.findByEmail(userEmail));
        Optional<com.MakeMyTrip.makeMyTrip.models.Hotel> hotelOptional = hotelRepository.findById(hotelId);
        if( userOptional.isPresent() && hotelOptional.isPresent()){
            Users user = userOptional.get();
            com.MakeMyTrip.makeMyTrip.models.Hotel hotel = hotelOptional.get();
            if( hotel.getAvailableRooms() < rooms){
                throw new RuntimeException("Sorry dawg, i have heart for u, not enough rooms available");
            }
            hotel.setAvailableRooms(hotel.getAvailableRooms() - rooms);
            hotelRepository.save(hotel);

            Users.Booking booking = new Users.Booking();
            booking.setType("Hotel");
            booking.setBookingId(hotelId);
            booking.setDate(LocalDate.now().toString());
            booking.setQuantity(rooms);
            booking.setTotalPrice(price);
            user.getBookings().add(booking);
            userRepository.save(user);
            return booking;

        }else{
            throw new RuntimeException("User or Hotel not found");
        }

    }


}
