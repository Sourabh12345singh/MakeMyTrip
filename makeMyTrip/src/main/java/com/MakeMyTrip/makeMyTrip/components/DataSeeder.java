package com.MakeMyTrip.makeMyTrip.components;

import com.MakeMyTrip.makeMyTrip.models.*;
import com.MakeMyTrip.makeMyTrip.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ReviewReplyRepository reviewReplyRepository;

    @Autowired
    private ReviewFlagRepository reviewFlagRepository;

    @Autowired
    private ReviewVoteRepository reviewVoteRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private FlightSeatMapRepository flightSeatMapRepository;

    @Autowired
    private HotelRoomTypeRepository hotelRoomTypeRepository;

    private static final int DESIRED_FLIGHTS = 15;
    private static final int DESIRED_HOTELS = 15;

    @Override
    public void run(String... args) {
        if (flightRepository.count() < DESIRED_FLIGHTS) {
            flightRepository.deleteAll();
            flightSeatMapRepository.deleteAll();
            seedFlights();
            System.out.println("Seeded " + DESIRED_FLIGHTS + " flights.");
        } else {
            System.out.println("Enough flights exist, skipping seed.");
        }

        if (hotelRepository.count() < DESIRED_HOTELS) {
            hotelRepository.deleteAll();
            hotelRoomTypeRepository.deleteAll();
            seedHotels();
            System.out.println("Seeded " + DESIRED_HOTELS + " hotels.");
        } else {
            System.out.println("Enough hotels exist, skipping seed.");
        }

        List<Flight> flights = flightRepository.findAll();
        for (Flight f : flights) {
            if (flightSeatMapRepository.findByFlightId(f.getId()) == null) {
                seedSeatMap(f);
            }
        }
        System.out.println("Seat maps verified for " + flights.size() + " flights.");

        List<Hotel> hotels = hotelRepository.findAll();
        for (Hotel h : hotels) {
            if (hotelRoomTypeRepository.findByHotelId(h.getId()).isEmpty()) {
                seedRoomTypes(h);
            }
        }
        System.out.println("Room types verified for " + hotels.size() + " hotels.");

        seedDummyReviews();
    }

    private void seedFlights() {
        seedFlight("IndiGo", "Delhi", "Mumbai", "06:30", "08:15", 4500, 120, 10, 6);
        seedFlight("Air India", "Mumbai", "Bangalore", "09:00", "11:00", 5200, 90, 10, 6);
        seedFlight("SpiceJet", "Delhi", "Chennai", "14:00", "16:30", 6800, 75, 10, 6);
        seedFlight("Vistara", "Bangalore", "Delhi", "17:00", "19:15", 7500, 60, 10, 6);
        seedFlight("GoAir", "Mumbai", "Goa", "08:00", "09:00", 3200, 100, 10, 6);
        seedFlight("Emirates", "Delhi", "Dubai", "02:00", "05:00", 25000, 180, 12, 8);
        seedFlight("Singapore Airlines", "Mumbai", "Singapore", "23:00", "07:30", 35000, 150, 12, 8);
        seedFlight("British Airways", "Delhi", "London", "01:30", "06:00", 60000, 200, 14, 8);
        seedFlight("Lufthansa", "Bangalore", "Frankfurt", "02:45", "08:15", 55000, 180, 14, 8);
        seedFlight("Qatar Airways", "Mumbai", "Doha", "03:30", "05:45", 28000, 160, 12, 8);
        seedFlight("AirAsia", "Chennai", "Kuala Lumpur", "06:00", "11:30", 18000, 140, 10, 6);
        seedFlight("Akasa Air", "Bangalore", "Kochi", "10:00", "11:15", 4200, 110, 10, 6);
        seedFlight("Air France", "Delhi", "Paris", "01:00", "05:45", 65000, 180, 14, 8);
        seedFlight("Thai Airways", "Mumbai", "Bangkok", "22:30", "04:00", 22000, 150, 12, 8);
        seedFlight("Japan Airlines", "Delhi", "Tokyo", "00:30", "10:00", 72000, 170, 14, 8);
    }

    private void seedHotels() {
        seedHotel("Taj Mahal Palace", "Mumbai", 12000, 50, "Pool, Spa, Gym, Restaurant");
        seedHotel("The Oberoi", "Delhi", 15000, 40, "Pool, Spa, Fine Dining, Business Center");
        seedHotel("ITC Gardenia", "Bangalore", 8500, 60, "Pool, Garden View, Restaurant, Gym");
        seedHotel("Park Hyatt", "Chennai", 7200, 45, "Pool, Spa, Restaurant, Conference Hall");
        seedHotel("Resort Rio", "Goa", 5500, 80, "Beach Access, Pool, Bar, Water Sports");
        seedHotel("The Ritz Carlton", "Mumbai", 25000, 30, "Pool, Spa, Fine Dining, Butler, Sea View");
        seedHotel("JW Marriott", "Delhi", 18000, 45, "Pool, Spa, Gym, Business Center, Lounge");
        seedHotel("The Lalit", "Bangalore", 9500, 55, "Pool, Spa, Restaurant, Bar, Rooftop");
        seedHotel("Radisson Blu", "Chennai", 6800, 50, "Pool, Gym, Restaurant, Conference Hall");
        seedHotel("Hilton Resort", "Goa", 12000, 70, "Beach Access, Pool, Bar, Water Sports, Spa");
        seedHotel("Hyatt Regency", "Kolkata", 7500, 60, "Pool, Gym, Restaurant, Business Center");
        seedHotel("The Leela Palace", "Udaipur", 22000, 35, "Pool, Spa, Lake View, Fine Dining, Heritage");
        seedHotel("Novotel", "Hyderabad", 6500, 65, "Pool, Gym, Restaurant, Bar");
        seedHotel("Sheraton Grand", "Pune", 8500, 50, "Pool, Spa, Gym, Restaurant, Lounge");
        seedHotel("Club Mahindra", "Munnar", 9500, 40, "Mountain View, Spa, Restaurant, Nature Trails");
    }

    private void seedHotel(String name, String location, double price, int rooms, String amenities) {
        Hotel h = new Hotel();
        h.setHotelName(name);
        h.setLocation(location);
        h.setPricePerNight(price);
        h.setAvailableRooms(rooms);
        h.setAmenities(amenities);
        hotelRepository.save(h);
    }

    private void seedFlight(String name, String from, String to, String dep, String arr, double price, int seats, int rows, int perRow) {
        Flight f = new Flight();
        f.setFlightName(name);
        f.setFrom(from);
        f.setTo(to);
        f.setDepartureTime(dep);
        f.setArrivalTime(arr);
        f.setPrice(price);
        f.setBasePrice(price);
        f.setAvailableSeats(seats);
        f.setTotalRows(rows);
        f.setSeatsPerRow(perRow);
        flightRepository.save(f);
    }

    private void seedSeatMap(Flight flight) {
        FlightSeatMap seatMap = new FlightSeatMap();
        seatMap.setFlightId(flight.getId());
        int rows = flight.getTotalRows() > 0 ? flight.getTotalRows() : 10;
        int cols = flight.getSeatsPerRow() > 0 ? flight.getSeatsPerRow() : 6;
        seatMap.setRows(rows);
        seatMap.setSeatsPerRow(cols);
        char[] letters = new char[cols];
        for (int i = 0; i < cols; i++) letters[i] = (char) ('A' + i);
        List<FlightSeatMap.Seat> seats = new ArrayList<>();
        Random rand = new Random(flight.getId().hashCode());
        int totalSeats = rows * cols;
        int bookedCount = (int) (totalSeats * 0.25);
        Set<Integer> bookedIndices = new HashSet<>();
        while (bookedIndices.size() < bookedCount) {
            bookedIndices.add(rand.nextInt(totalSeats));
        }
        int idx = 0;
        int businessRows = Math.max(2, rows / 5);
        int premiumRows = Math.max(3, rows / 3);
        for (int r = 1; r <= rows; r++) {
            for (int c = 0; c < cols; c++) {
                String seatNum = r + String.valueOf(letters[c]);
                String type;
                double premium;
                if (r <= businessRows) {
                    type = "BUSINESS";
                    premium = flight.getBasePrice() * 0.50;
                } else if (r <= premiumRows) {
                    type = "PREMIUM_ECONOMY";
                    premium = flight.getBasePrice() * 0.20;
                } else {
                    type = "ECONOMY";
                    premium = 0;
                }
                seats.add(new FlightSeatMap.Seat(seatNum, type, premium, bookedIndices.contains(idx)));
                idx++;
            }
        }
        seatMap.setSeats(seats);
        flightSeatMapRepository.save(seatMap);
    }

    private void seedRoomTypes(Hotel hotel) {
        seedRoomType(hotel, "Standard Room", "Comfortable room with essential amenities", 0, 60, 80,
            "Standard", "WiFi, TV, Air Conditioning");
        seedRoomType(hotel, "Deluxe Room", "Spacious room with premium furnishings and city view", hotel.getPricePerNight() * 0.30, 25, 40,
            "Deluxe", "WiFi, TV, Air Conditioning, Mini Bar, City View");
        seedRoomType(hotel, "Suite", "Luxury suite with separate living area and panoramic views", hotel.getPricePerNight() * 0.70, 8, 15,
            "Suite", "WiFi, TV, Air Conditioning, Mini Bar, Living Room, Panoramic View, Butler Service");
    }

    private void seedRoomType(Hotel hotel, String name, String desc, double premium, int avail, int total,
                               String svgType, String amenitiesStr) {
        HotelRoomType rt = new HotelRoomType();
        rt.setHotelId(hotel.getId());
        rt.setName(name);
        rt.setDescription(desc);
        rt.setPricePremium(premium);
        rt.setAvailable(avail);
        rt.setTotal(total);
        rt.setImageSvg(generateRoomSvg(svgType));
        rt.setAmenities(Arrays.asList(amenitiesStr.split(", ")));
        hotelRoomTypeRepository.save(rt);
    }

    private String generateRoomSvg(String type) {
        String color1, color2, accent;
        switch (type) {
            case "Deluxe":
                color1 = "#1e3a5f"; color2 = "#2d5a87"; accent = "#f0c040";
                break;
            case "Suite":
                color1 = "#3a1a4a"; color2 = "#5c2d7a"; accent = "#e8d060";
                break;
            default:
                color1 = "#1a2a3a"; color2 = "#2a4a5a"; accent = "#60b0c0";
        }
        return "<svg viewBox='0 0 200 140' xmlns='http://www.w3.org/2000/svg'>"
            + "<rect width='200' height='140' rx='8' fill='" + color1 + "' stroke='" + accent + "' stroke-width='1.5'/>"
            + "<rect x='5' y='10' width='50' height='60' rx='4' fill='" + color2 + "' stroke='" + accent + "' stroke-width='1' opacity='0.7'/>"
            + "<line x1='30' y1='10' x2='30' y2='70' stroke='" + accent + "' stroke-width='0.8' opacity='0.5'/>"
            + "<line x1='5' y1='40' x2='55' y2='40' stroke='" + accent + "' stroke-width='0.8' opacity='0.5'/>"
            + "<rect x='65' y='20' width='55' height='40' rx='3' fill='#3a5a7a' stroke='" + accent + "' stroke-width='1' opacity='0.8'/>"
            + "<rect x='70' y='25' width='45' height='15' rx='2' fill='#4a7aaa' opacity='0.6'/>"
            + "<rect x='70' y='43' width='45' height='12' rx='2' fill='#4a7aaa' opacity='0.4'/>"
            + "<rect x='130' y='15' width='25' height='18' rx='2' fill='" + color2 + "' stroke='" + accent + "' stroke-width='0.8' opacity='0.9'/>"
            + "<circle cx='142' cy='24' r='3' fill='" + accent + "' opacity='0.8'/>"
            + "<rect x='130' y='45' width='25' height='18' rx='2' fill='" + color2 + "' stroke='" + accent + "' stroke-width='0.8' opacity='0.9'/>"
            + "<circle cx='142' cy='54' r='2' fill='" + accent + "' opacity='0.6'/>"
            + "<rect x='60' y='80' width='80' height='50' rx='6' fill='#2a3a4a' stroke='" + accent + "' stroke-width='1'/>"
            + "<rect x='65' y='85' width='70' height='20' rx='3' fill='#3a5a6a' opacity='0.6'/>"
            + "<rect x='65' y='108' width='30' height='18' rx='2' fill='#4a5a6a' opacity='0.5'/>"
            + "<circle cx='110' cy='118' r='8' fill='" + accent + "' opacity='0.3'/>"
            + "<circle cx='110' cy='118' r='4' fill='" + accent + "' opacity='0.5'/>"
            + "</svg>";
    }

    private void seedDummyReviews() {
        List<Flight> flights = flightRepository.findAll();
        List<Hotel> hotels = hotelRepository.findAll();

        if (hotels.isEmpty() || flights.isEmpty()) {
            System.out.println("No hotels or flights found to seed reviews.");
            return;
        }

        Random rand = new Random();
        String[] userNames = {"John Smith", "Sarah Johnson", "Michael Brown", "Emily Davis", "David Wilson",
            "Jessica Miller", "Christopher Taylor", "Ashley Anderson", "Matthew Thomas", "Amanda Martinez"};

        String[] reviewTitles = {"Excellent Service!", "Great Experience", "Could Be Better", "Terrible Experience",
            "Average Flight", "Amazing Hotel", "Disappointing", "Worth Every Penny", "Poor Service", "Good Value"};

        String[] reviewDescriptions = {
            "The flight was on time and the staff was very friendly. Highly recommend!",
            "The hotel exceeded my expectations. Beautiful rooms and great amenities.",
            "The food was okay but the service was slow.",
            "The flight was delayed by 3 hours and the staff was unhelpful.",
            "Overall good but could improve on customer service.",
            "Amazing experience from check-in to check-out. Will book again!",
            "The hotel was clean but the WiFi was slow.",
            "Great value for the money. The flight was comfortable.",
            "Poor service and uncomfortable seats.",
            "Nice facility but maintenance was lacking."
        };

        String[] commentReasons = {"Hate", "Feels outdated", "Broken", "Annoying", "Not helpful"};

        String[] flagReasons = {"Inappropriate content", "Spam", "False information", "Hate speech", "Privacy violation"};

        // Seed 3-5 reviews for EVERY flight
        for (Flight flight : flights) {
            long existingFlightReviews = reviewRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc("Flight", flight.getId()).size();
            if (existingFlightReviews == 0) {
                int count = rand.nextInt(3) + 3; // 3 to 5 reviews
                for (int i = 0; i < count; i++) {
                    seedReview("Flight", flight.getId(), userNames[rand.nextInt(userNames.length)],
                        reviewTitles[rand.nextInt(reviewTitles.length)],
                        reviewDescriptions[rand.nextInt(reviewDescriptions.length)],
                        rand.nextInt(5) + 1, rand.nextInt(2), 5, flight);
                }
            }
        }

        // Seed 3-5 reviews for EVERY hotel
        for (Hotel hotel : hotels) {
            long existingHotelReviews = reviewRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc("Hotel", hotel.getId()).size();
            if (existingHotelReviews == 0) {
                int count = rand.nextInt(3) + 3; // 3 to 5 reviews
                for (int i = 0; i < count; i++) {
                    seedReview("Hotel", hotel.getId(), userNames[rand.nextInt(userNames.length)],
                        reviewTitles[rand.nextInt(reviewTitles.length)],
                        reviewDescriptions[rand.nextInt(reviewDescriptions.length)],
                        rand.nextInt(5) + 1, rand.nextInt(2), 5, hotel);
                }
            }
        }
    }

    private void seedReview(String entityType, String entityId, String userName, String title,
                           String description, int rating, int imageCount, int maxImages, Flight flight) {
        Random rand = new Random();
        Review review = new Review();
        review.setEntityType(entityType);
        review.setEntityId(entityId);
        review.setUserEmail("user" + Math.abs(entityId.hashCode()) % 10000 + "@example.com");
        review.setUserName(userName);
        review.setRating(rating);
        review.setTitle(title);
        review.setDescription(description);
        review.setHelpfulCount(0);
        review.setCreatedAt(LocalDateTime.now().minusDays(rand.nextInt(30)).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        review.setUpdatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        List<String> imageUrls = new ArrayList<>();
        for (int i = 0; i < imageCount; i++) {
            imageUrls.add("https://picsum.photos/seed/" + Math.abs(rand.nextInt()) + "/200/200");
        }
        review.setImageUrls(imageUrls);

        Review savedReview = reviewRepository.save(review);

        if (entityType.equals("Flight")) {
            seedReplies(savedReview.getId(), rand.nextInt(3) + 1);
            if (rand.nextDouble() < 0.3) {
                seedFlag(savedReview.getId(), rand.nextDouble() < 0.5 ? ReviewFlagStatus.RESOLVED : ReviewFlagStatus.PENDING);
            }
        } else {
            seedReplies(savedReview.getId(), rand.nextInt(2) + 1);
            if (rand.nextDouble() < 0.4) {
                seedFlag(savedReview.getId(), ReviewFlagStatus.PENDING);
            }
        }

        seedVotes(savedReview.getId(), rand.nextInt(5) + 2);
    }

    private void seedReview(String entityType, String entityId, String userName, String title,
                           String description, int rating, int imageCount, int maxImages, Hotel hotel) {
        seedReview(entityType, entityId, userName, title, description, rating, imageCount, maxImages, (Flight) null);
    }

    private void seedReplies(String reviewId, int replyCount) {
        Random rand = new Random();
        String[] staffReplies = {
            "Thank you for your feedback! We're glad you enjoyed your experience.",
            "We apologize for any inconvenience you experienced. Please contact us directly.",
            "We're working hard to improve our services based on feedback like yours.",
            "Thank you for choosing us. We appreciate your business!"
        };

        for (int i = 0; i < replyCount; i++) {
            ReviewReply reply = new ReviewReply();
            reply.setReviewId(reviewId);
            reply.setUserEmail("support@makemytrip.com");
            reply.setUserName("Support Team");
            reply.setText(staffReplies[rand.nextInt(staffReplies.length)]);
            reply.setCreatedAt(LocalDateTime.now().minusDays(rand.nextInt(10)).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            reviewReplyRepository.save(reply);
        }
    }

    private void seedFlag(String reviewId, String status) {
        Random rand = new Random();
        ReviewFlag flag = new ReviewFlag();
        flag.setReviewId(reviewId);
        flag.setFlaggedByEmail("moderator@example.com");
        flag.setReason("Inappropriate content");
        flag.setStatus(status);
        flag.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        reviewFlagRepository.save(flag);
    }

    private void seedVotes(String reviewId, int helpfulVotes) {
        Random rand = new Random();
        Set<String> votedEmails = new HashSet<>();

        for (int i = 0; i < helpfulVotes; i++) {
            ReviewVote vote = new ReviewVote();
            vote.setReviewId(reviewId);
            vote.setUserEmail("user" + (i + 1) + "@example.com");
            vote.setType(ReviewVoteType.HELPFUL);
            vote.setCreatedAt(LocalDateTime.now().minusDays(rand.nextInt(10)).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            reviewVoteRepository.save(vote);
        }

        int notHelpfulCount = helpfulVotes / 3;
        for (int i = 0; i < notHelpfulCount; i++) {
            ReviewVote vote = new ReviewVote();
            vote.setReviewId(reviewId);
            vote.setUserEmail("negativeuser" + i + "@example.com");
            vote.setType(ReviewVoteType.NOT_HELPFUL);
            vote.setCreatedAt(LocalDateTime.now().minusDays(rand.nextInt(15)).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            reviewVoteRepository.save(vote);
        }
    }
}
