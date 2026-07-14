package com.MakeMyTrip.makeMyTrip.components;

import com.MakeMyTrip.makeMyTrip.models.Flight;
import com.MakeMyTrip.makeMyTrip.models.Hotel;
import com.MakeMyTrip.makeMyTrip.repositories.FlightRepository;
import com.MakeMyTrip.makeMyTrip.repositories.HotelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Override
    public void run(String... args) {
        if (flightRepository.count() == 0) {
            seedFlights();
            System.out.println("Seeded 5 flights.");
        } else {
            System.out.println("Flights already exist, skipping seed.");
        }

        if (hotelRepository.count() == 0) {
            seedHotels();
            System.out.println("Seeded 5 hotels.");
        } else {
            System.out.println("Hotels already exist, skipping seed.");
        }
    }

    private void seedFlights() {
        Flight f1 = new Flight();
        f1.setFlightName("IndiGo");
        f1.setFrom("Delhi");
        f1.setTo("Mumbai");
        f1.setDepartureTime("06:30");
        f1.setArrivalTime("08:15");
        f1.setPrice(4500);
        f1.setBasePrice(4500);
        f1.setAvailableSeats(120);
        flightRepository.save(f1);

        Flight f2 = new Flight();
        f2.setFlightName("Air India");
        f2.setFrom("Mumbai");
        f2.setTo("Bangalore");
        f2.setDepartureTime("09:00");
        f2.setArrivalTime("11:00");
        f2.setPrice(5200);
        f2.setBasePrice(5200);
        f2.setAvailableSeats(90);
        flightRepository.save(f2);

        Flight f3 = new Flight();
        f3.setFlightName("SpiceJet");
        f3.setFrom("Delhi");
        f3.setTo("Chennai");
        f3.setDepartureTime("14:00");
        f3.setArrivalTime("16:30");
        f3.setPrice(6800);
        f3.setBasePrice(6800);
        f3.setAvailableSeats(75);
        flightRepository.save(f3);

        Flight f4 = new Flight();
        f4.setFlightName("Vistara");
        f4.setFrom("Bangalore");
        f4.setTo("Delhi");
        f4.setDepartureTime("17:00");
        f4.setArrivalTime("19:15");
        f4.setPrice(7500);
        f4.setBasePrice(7500);
        f4.setAvailableSeats(60);
        flightRepository.save(f4);

        Flight f5 = new Flight();
        f5.setFlightName("GoAir");
        f5.setFrom("Mumbai");
        f5.setTo("Goa");
        f5.setDepartureTime("08:00");
        f5.setArrivalTime("09:00");
        f5.setPrice(3200);
        f5.setBasePrice(3200);
        f5.setAvailableSeats(100);
        flightRepository.save(f5);
    }

    private void seedHotels() {
        Hotel h1 = new Hotel();
        h1.setHotelName("Taj Mahal Palace");
        h1.setLocation("Mumbai");
        h1.setPricePerNight(12000);
        h1.setAvailableRooms(50);
        h1.setAmenities("Pool, Spa, Gym, Restaurant");
        hotelRepository.save(h1);

        Hotel h2 = new Hotel();
        h2.setHotelName("The Oberoi");
        h2.setLocation("Delhi");
        h2.setPricePerNight(15000);
        h2.setAvailableRooms(40);
        h2.setAmenities("Pool, Spa, Fine Dining, Business Center");
        hotelRepository.save(h2);

        Hotel h3 = new Hotel();
        h3.setHotelName("ITC Gardenia");
        h3.setLocation("Bangalore");
        h3.setPricePerNight(8500);
        h3.setAvailableRooms(60);
        h3.setAmenities("Pool, Garden View, Restaurant, Gym");
        hotelRepository.save(h3);

        Hotel h4 = new Hotel();
        h4.setHotelName("Park Hyatt");
        h4.setLocation("Chennai");
        h4.setPricePerNight(7200);
        h4.setAvailableRooms(45);
        h4.setAmenities("Pool, Spa, Restaurant, Conference Hall");
        hotelRepository.save(h4);

        Hotel h5 = new Hotel();
        h5.setHotelName("Resort Rio");
        h5.setLocation("Goa");
        h5.setPricePerNight(5500);
        h5.setAvailableRooms(80);
        h5.setAmenities("Beach Access, Pool, Bar, Water Sports");
        hotelRepository.save(h5);
    }
}
