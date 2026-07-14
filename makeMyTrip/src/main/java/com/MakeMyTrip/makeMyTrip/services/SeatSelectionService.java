package com.MakeMyTrip.makeMyTrip.services;

import com.MakeMyTrip.makeMyTrip.models.*;
import com.MakeMyTrip.makeMyTrip.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SeatSelectionService {

    @Autowired
    private FlightSeatMapRepository flightSeatMapRepository;
    @Autowired
    private HotelRoomTypeRepository hotelRoomTypeRepository;
    @Autowired
    private SavedPreferenceRepository savedPreferenceRepository;

    public FlightSeatMap getSeatMap(String flightId) {
        FlightSeatMap seatMap = flightSeatMapRepository.findByFlightId(flightId);
        if (seatMap == null) {
            throw new RuntimeException("Seat map not found for flight: " + flightId);
        }
        return seatMap;
    }

    public FlightSeatMap bookSeats(String flightId, List<String> seatNumbers) {
        FlightSeatMap seatMap = flightSeatMapRepository.findByFlightId(flightId);
        if (seatMap == null) throw new RuntimeException("Seat map not found");

        Set<String> seatSet = new HashSet<>(seatNumbers);
        if (seatSet.size() != seatNumbers.size()) {
            throw new RuntimeException("Duplicate seat numbers provided");
        }

        List<FlightSeatMap.Seat> seats = seatMap.getSeats();
        for (FlightSeatMap.Seat seat : seats) {
            if (seatNumbers.contains(seat.getSeatNumber())) {
                if (seat.isBooked()) {
                    throw new RuntimeException("Seat " + seat.getSeatNumber() + " is already booked");
                }
                seat.setBooked(true);
            }
        }

        flightSeatMapRepository.save(seatMap);
        return seatMap;
    }

    public List<HotelRoomType> getRoomTypes(String hotelId) {
        return hotelRoomTypeRepository.findByHotelId(hotelId);
    }

    public HotelRoomType bookRoomType(String hotelId, String roomTypeId, int quantity) {
        HotelRoomType roomType = hotelRoomTypeRepository.findById(roomTypeId)
            .orElseThrow(() -> new RuntimeException("Room type not found"));

        if (!roomType.getHotelId().equals(hotelId)) {
            throw new RuntimeException("Room type does not belong to this hotel");
        }
        if (roomType.getAvailable() < quantity) {
            throw new RuntimeException("Not enough rooms of this type available");
        }

        roomType.setAvailable(roomType.getAvailable() - quantity);
        hotelRoomTypeRepository.save(roomType);
        return roomType;
    }

    public SavedPreference savePreference(String userEmail, String type, String value) {
        savedPreferenceRepository.deleteByUserEmailAndType(userEmail, type);
        SavedPreference pref = new SavedPreference();
        pref.setUserEmail(userEmail);
        pref.setType(type);
        pref.setValue(value);
        return savedPreferenceRepository.save(pref);
    }

    public List<SavedPreference> getPreferences(String userEmail) {
        return savedPreferenceRepository.findByUserEmail(userEmail);
    }
}
