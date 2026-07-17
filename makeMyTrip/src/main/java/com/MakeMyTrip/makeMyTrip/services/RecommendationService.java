package com.MakeMyTrip.makeMyTrip.services;

import com.MakeMyTrip.makeMyTrip.models.*;
import com.MakeMyTrip.makeMyTrip.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private FlightRepository flightRepository;
    @Autowired
    private HotelRepository hotelRepository;
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private RecommendationRepository recommendationRepository;
    @Autowired
    private RecommendationFeedbackRepository feedbackRepository;

    private static final DateTimeFormatter DTF = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    /**
     * Generate personalized recommendations for a user.
     * Uses content-based filtering, collaborative filtering, and review data.
     */
    public List<Recommendation> generateRecommendations(String userEmail) {
        // Clear old recommendations
        recommendationRepository.deleteByUserEmail(userEmail);

        Users user = userRepository.findByEmail(userEmail);
        if (user == null) return Collections.emptyList();

        List<Recommendation> allRecs = new ArrayList<>();
        List<Users.Booking> bookings = user.getBookings();
        if (bookings == null) bookings = new ArrayList<>();

        // Get feedback to adjust scoring
        List<RecommendationFeedback> feedback = feedbackRepository.findByUserEmail(userEmail);
        Map<String, Double> categoryBoost = calculateCategoryBoosts(feedback);

        // Collect user's booked entity IDs to avoid recommending what they already booked
        Set<String> bookedFlightIds = bookings.stream()
            .filter(b -> "Flight".equals(b.getType()) && !b.isCancelled())
            .map(Users.Booking::getBookingId)
            .collect(Collectors.toSet());
        Set<String> bookedHotelIds = bookings.stream()
            .filter(b -> "Hotel".equals(b.getType()) && !b.isCancelled())
            .map(Users.Booking::getBookingId)
            .collect(Collectors.toSet());

        // === Strategy 1: Destination-based (Content Filtering) ===
        allRecs.addAll(generateDestinationRecs(userEmail, bookings, bookedFlightIds, categoryBoost));

        // === Strategy 2: Price-range based ===
        allRecs.addAll(generatePriceRangeRecs(userEmail, bookings, bookedFlightIds, bookedHotelIds, categoryBoost));

        // === Strategy 3: High-rating based ===
        allRecs.addAll(generateHighRatingRecs(userEmail, bookedFlightIds, bookedHotelIds, categoryBoost));

        // === Strategy 4: Collaborative filtering ===
        allRecs.addAll(generateCollaborativeRecs(userEmail, bookings, bookedFlightIds, bookedHotelIds, categoryBoost));

        // === Strategy 5: Popular destinations (fallback for new users) ===
        if (allRecs.isEmpty()) {
            allRecs.addAll(generatePopularRecs(userEmail, categoryBoost));
        }

        // De-duplicate by entityId, keeping highest score
        Map<String, Recommendation> deduped = new LinkedHashMap<>();
        for (Recommendation rec : allRecs) {
            String key = rec.getEntityType() + ":" + rec.getEntityId();
            if (!deduped.containsKey(key) || deduped.get(key).getScore() < rec.getScore()) {
                deduped.put(key, rec);
            }
        }

        List<Recommendation> finalRecs = new ArrayList<>(deduped.values());
        finalRecs.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));

        // Limit to top 20
        if (finalRecs.size() > 20) finalRecs = finalRecs.subList(0, 20);

        // Save all
        recommendationRepository.saveAll(finalRecs);
        return finalRecs;
    }

    /**
     * Get existing recommendations (without regenerating)
     */
    public List<Recommendation> getRecommendations(String userEmail) {
        List<Recommendation> recs = recommendationRepository.findByUserEmailAndDismissedFalseOrderByScoreDesc(userEmail);
        if (recs.isEmpty()) {
            return generateRecommendations(userEmail);
        }
        return recs;
    }

    /**
     * Submit feedback on a recommendation
     */
    public RecommendationFeedback submitFeedback(String recommendationId, String userEmail, String feedbackType) {
        Recommendation rec = recommendationRepository.findById(recommendationId)
            .orElseThrow(() -> new RuntimeException("Recommendation not found"));

        if ("irrelevant".equals(feedbackType)) {
            rec.setDismissed(true);
            rec.setHelpful(false);
        } else if ("helpful".equals(feedbackType)) {
            rec.setHelpful(true);
            rec.setDismissed(false);
        }
        recommendationRepository.save(rec);

        RecommendationFeedback fb = new RecommendationFeedback();
        fb.setUserEmail(userEmail);
        fb.setRecommendationId(recommendationId);
        fb.setFeedbackType(feedbackType);
        fb.setCreatedAt(DTF.format(LocalDateTime.now()));
        return feedbackRepository.save(fb);
    }

    // ========== PRIVATE STRATEGY METHODS ==========

    private List<Recommendation> generateDestinationRecs(String userEmail, List<Users.Booking> bookings,
            Set<String> bookedFlightIds, Map<String, Double> categoryBoost) {
        List<Recommendation> recs = new ArrayList<>();
        
        // Find destinations ("to" cities) user has flown to
        Map<String, Integer> destinationCounts = new HashMap<>();
        for (Users.Booking b : bookings) {
            if ("Flight".equals(b.getType()) && !b.isCancelled()) {
                flightRepository.findById(b.getBookingId()).ifPresent(flight -> {
                    destinationCounts.merge(flight.getTo(), 1, Integer::sum);
                });
            }
        }

        // For each favorite destination, find other flights to the same place they haven't booked
        for (Map.Entry<String, Integer> entry : destinationCounts.entrySet()) {
            String dest = entry.getKey();
            int count = entry.getValue();
            List<Flight> flights = flightRepository.findAll().stream()
                .filter(f -> f.getTo().equalsIgnoreCase(dest) && !bookedFlightIds.contains(f.getId()))
                .limit(3)
                .collect(Collectors.toList());

            for (Flight f : flights) {
                Recommendation rec = new Recommendation();
                rec.setUserEmail(userEmail);
                rec.setEntityType("Flight");
                rec.setEntityId(f.getId());
                rec.setEntityName(f.getFlightName() + " - " + f.getFrom() + " → " + f.getTo());
                rec.setReason("You've visited " + dest + " " + count + " time(s)! Here's another flight option.");
                rec.setReasonCategory("destination_preference");
                double baseScore = Math.min(0.9, 0.5 + (count * 0.1));
                rec.setScore(baseScore * categoryBoost.getOrDefault("destination_preference", 1.0));
                rec.setImageUrl("https://picsum.photos/seed/" + f.getId() + "/400/250");
                Map<String, Object> meta = new HashMap<>();
                meta.put("price", f.getPrice());
                meta.put("from", f.getFrom());
                meta.put("to", f.getTo());
                meta.put("departure", f.getDepartureTime());
                rec.setMetadata(meta);
                rec.setCreatedAt(DTF.format(LocalDateTime.now()));
                recs.add(rec);
            }

            // Also recommend hotels in that destination
            List<Hotel> hotels = hotelRepository.findAll().stream()
                .filter(h -> h.getLocation() != null && h.getLocation().toLowerCase().contains(dest.toLowerCase()))
                .limit(2)
                .collect(Collectors.toList());
            for (Hotel h : hotels) {
                Recommendation rec = new Recommendation();
                rec.setUserEmail(userEmail);
                rec.setEntityType("Hotel");
                rec.setEntityId(h.getId());
                rec.setEntityName(h.getHotelName());
                rec.setReason("You love " + dest + "! Stay at " + h.getHotelName() + " on your next trip.");
                rec.setReasonCategory("destination_preference");
                rec.setScore(0.7 * categoryBoost.getOrDefault("destination_preference", 1.0));
                rec.setImageUrl("https://picsum.photos/seed/" + h.getId() + "/400/250");
                Map<String, Object> meta = new HashMap<>();
                meta.put("pricePerNight", h.getPricePerNight());
                meta.put("location", h.getLocation());
                meta.put("amenities", h.getAmenities());
                rec.setMetadata(meta);
                rec.setCreatedAt(DTF.format(LocalDateTime.now()));
                recs.add(rec);
            }
        }
        return recs;
    }

    private List<Recommendation> generatePriceRangeRecs(String userEmail, List<Users.Booking> bookings,
            Set<String> bookedFlightIds, Set<String> bookedHotelIds, Map<String, Double> categoryBoost) {
        List<Recommendation> recs = new ArrayList<>();

        // Calculate average spend
        double avgFlightSpend = bookings.stream()
            .filter(b -> "Flight".equals(b.getType()) && !b.isCancelled())
            .mapToDouble(Users.Booking::getTotalPrice)
            .average().orElse(-1);

        double avgHotelSpend = bookings.stream()
            .filter(b -> "Hotel".equals(b.getType()) && !b.isCancelled())
            .mapToDouble(Users.Booking::getTotalPrice)
            .average().orElse(-1);

        if (avgFlightSpend > 0) {
            double lowBound = avgFlightSpend * 0.5;
            double highBound = avgFlightSpend * 1.5;
            List<Flight> affordable = flightRepository.findAll().stream()
                .filter(f -> f.getPrice() >= lowBound && f.getPrice() <= highBound && !bookedFlightIds.contains(f.getId()))
                .limit(4)
                .collect(Collectors.toList());

            for (Flight f : affordable) {
                Recommendation rec = new Recommendation();
                rec.setUserEmail(userEmail);
                rec.setEntityType("Flight");
                rec.setEntityId(f.getId());
                rec.setEntityName(f.getFlightName() + " - " + f.getFrom() + " → " + f.getTo());
                rec.setReason(String.format("Within your budget! You usually spend around ₹%.0f on flights.", avgFlightSpend));
                rec.setReasonCategory("price_range");
                rec.setScore(0.65 * categoryBoost.getOrDefault("price_range", 1.0));
                rec.setImageUrl("https://picsum.photos/seed/price" + f.getId() + "/400/250");
                Map<String, Object> meta = new HashMap<>();
                meta.put("price", f.getPrice());
                meta.put("from", f.getFrom());
                meta.put("to", f.getTo());
                rec.setMetadata(meta);
                rec.setCreatedAt(DTF.format(LocalDateTime.now()));
                recs.add(rec);
            }
        }

        if (avgHotelSpend > 0) {
            double perNightAvg = avgHotelSpend; // rough estimate
            List<Hotel> affordable = hotelRepository.findAll().stream()
                .filter(h -> h.getPricePerNight() <= perNightAvg * 1.3 && !bookedHotelIds.contains(h.getId()))
                .limit(3)
                .collect(Collectors.toList());

            for (Hotel h : affordable) {
                Recommendation rec = new Recommendation();
                rec.setUserEmail(userEmail);
                rec.setEntityType("Hotel");
                rec.setEntityId(h.getId());
                rec.setEntityName(h.getHotelName());
                rec.setReason(String.format("Budget-friendly! ₹%.0f/night fits your typical spending.", h.getPricePerNight()));
                rec.setReasonCategory("price_range");
                rec.setScore(0.6 * categoryBoost.getOrDefault("price_range", 1.0));
                rec.setImageUrl("https://picsum.photos/seed/hotel" + h.getId() + "/400/250");
                Map<String, Object> meta = new HashMap<>();
                meta.put("pricePerNight", h.getPricePerNight());
                meta.put("location", h.getLocation());
                rec.setMetadata(meta);
                rec.setCreatedAt(DTF.format(LocalDateTime.now()));
                recs.add(rec);
            }
        }
        return recs;
    }

    private List<Recommendation> generateHighRatingRecs(String userEmail, Set<String> bookedFlightIds,
            Set<String> bookedHotelIds, Map<String, Double> categoryBoost) {
        List<Recommendation> recs = new ArrayList<>();

        // Find entities with highest average ratings from reviews
        List<Review> allReviews = reviewRepository.findAll();
        Map<String, List<Review>> grouped = allReviews.stream()
            .collect(Collectors.groupingBy(r -> r.getEntityType() + ":" + r.getEntityId()));

        for (Map.Entry<String, List<Review>> entry : grouped.entrySet()) {
            List<Review> reviews = entry.getValue();
            double avgRating = reviews.stream().mapToInt(Review::getRating).average().orElse(0);
            if (avgRating < 4.0 || reviews.size() < 2) continue;

            String[] parts = entry.getKey().split(":");
            String entityType = parts[0];
            String entityId = parts[1];

            if ("Flight".equals(entityType) && bookedFlightIds.contains(entityId)) continue;
            if ("Hotel".equals(entityType) && bookedHotelIds.contains(entityId)) continue;

            Recommendation rec = new Recommendation();
            rec.setUserEmail(userEmail);
            rec.setEntityType(entityType);
            rec.setEntityId(entityId);
            rec.setReasonCategory("high_rating");
            rec.setScore(Math.min(0.85, (avgRating / 5.0) * 0.8 + (reviews.size() * 0.02))
                * categoryBoost.getOrDefault("high_rating", 1.0));
            rec.setImageUrl("https://picsum.photos/seed/rated" + entityId + "/400/250");
            rec.setCreatedAt(DTF.format(LocalDateTime.now()));

            Map<String, Object> meta = new HashMap<>();
            meta.put("avgRating", Math.round(avgRating * 10.0) / 10.0);
            meta.put("reviewCount", reviews.size());

            if ("Flight".equals(entityType)) {
                flightRepository.findById(entityId).ifPresent(f -> {
                    rec.setEntityName(f.getFlightName() + " - " + f.getFrom() + " → " + f.getTo());
                    rec.setReason(String.format("Highly rated! %.1f★ average from %d reviews.", avgRating, reviews.size()));
                    meta.put("price", f.getPrice());
                    meta.put("from", f.getFrom());
                    meta.put("to", f.getTo());
                });
            } else if ("Hotel".equals(entityType)) {
                hotelRepository.findById(entityId).ifPresent(h -> {
                    rec.setEntityName(h.getHotelName());
                    rec.setReason(String.format("Top rated hotel! %.1f★ from %d travelers.", avgRating, reviews.size()));
                    meta.put("pricePerNight", h.getPricePerNight());
                    meta.put("location", h.getLocation());
                });
            }
            rec.setMetadata(meta);

            if (rec.getEntityName() != null) {
                recs.add(rec);
            }
        }
        return recs;
    }

    private List<Recommendation> generateCollaborativeRecs(String userEmail, List<Users.Booking> userBookings,
            Set<String> bookedFlightIds, Set<String> bookedHotelIds, Map<String, Double> categoryBoost) {
        List<Recommendation> recs = new ArrayList<>();

        // Get items this user has booked
        Set<String> userItems = userBookings.stream()
            .filter(b -> !b.isCancelled())
            .map(Users.Booking::getBookingId)
            .collect(Collectors.toSet());

        if (userItems.isEmpty()) return recs;

        // Find other users who booked similar items
        List<Users> allUsers = userRepository.findAll();
        Map<String, Integer> itemPopularity = new HashMap<>();

        for (Users other : allUsers) {
            if (other.getEmail().equals(userEmail)) continue;
            if (other.getBookings() == null) continue;

            // Calculate overlap
            Set<String> otherItems = other.getBookings().stream()
                .filter(b -> !b.isCancelled())
                .map(Users.Booking::getBookingId)
                .collect(Collectors.toSet());

            long overlap = otherItems.stream().filter(userItems::contains).count();
            if (overlap == 0) continue;

            // Items the other user booked that this user hasn't
            for (Users.Booking b : other.getBookings()) {
                if (!b.isCancelled() && !userItems.contains(b.getBookingId())) {
                    itemPopularity.merge(b.getType() + ":" + b.getBookingId(), (int) overlap, Integer::sum);
                }
            }
        }

        // Sort by popularity and take top items
        List<Map.Entry<String, Integer>> sorted = itemPopularity.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .limit(6)
            .collect(Collectors.toList());

        for (Map.Entry<String, Integer> entry : sorted) {
            String[] parts = entry.getKey().split(":");
            String type = parts[0];
            String entityId = parts[1];
            int similarUsers = entry.getValue();

            Recommendation rec = new Recommendation();
            rec.setUserEmail(userEmail);
            rec.setEntityType(type);
            rec.setEntityId(entityId);
            rec.setReasonCategory("collaborative");
            rec.setScore(Math.min(0.8, 0.4 + similarUsers * 0.1)
                * categoryBoost.getOrDefault("collaborative", 1.0));
            rec.setImageUrl("https://picsum.photos/seed/collab" + entityId + "/400/250");
            rec.setCreatedAt(DTF.format(LocalDateTime.now()));

            Map<String, Object> meta = new HashMap<>();
            meta.put("similarTravelers", similarUsers);

            if ("Flight".equals(type)) {
                if (bookedFlightIds.contains(entityId)) continue;
                flightRepository.findById(entityId).ifPresent(f -> {
                    rec.setEntityName(f.getFlightName() + " - " + f.getFrom() + " → " + f.getTo());
                    rec.setReason(similarUsers + " travelers with similar tastes also booked this flight!");
                    meta.put("price", f.getPrice());
                    meta.put("from", f.getFrom());
                    meta.put("to", f.getTo());
                });
            } else if ("Hotel".equals(type)) {
                if (bookedHotelIds.contains(entityId)) continue;
                hotelRepository.findById(entityId).ifPresent(h -> {
                    rec.setEntityName(h.getHotelName());
                    rec.setReason(similarUsers + " travelers like you also stayed at " + h.getHotelName() + "!");
                    meta.put("pricePerNight", h.getPricePerNight());
                    meta.put("location", h.getLocation());
                });
            }
            rec.setMetadata(meta);

            if (rec.getEntityName() != null) {
                recs.add(rec);
            }
        }
        return recs;
    }

    private List<Recommendation> generatePopularRecs(String userEmail, Map<String, Double> categoryBoost) {
        List<Recommendation> recs = new ArrayList<>();

        // Popular flights (most booked)
        List<Flight> allFlights = flightRepository.findAll();
        allFlights.sort((a, b) -> Integer.compare(a.getAvailableSeats(), b.getAvailableSeats())); // fewer seats = more popular
        for (Flight f : allFlights.subList(0, Math.min(4, allFlights.size()))) {
            Recommendation rec = new Recommendation();
            rec.setUserEmail(userEmail);
            rec.setEntityType("Flight");
            rec.setEntityId(f.getId());
            rec.setEntityName(f.getFlightName() + " - " + f.getFrom() + " → " + f.getTo());
            rec.setReason("Trending! This is one of our most popular flights right now.");
            rec.setReasonCategory("popular");
            rec.setScore(0.5 * categoryBoost.getOrDefault("popular", 1.0));
            rec.setImageUrl("https://picsum.photos/seed/pop" + f.getId() + "/400/250");
            Map<String, Object> meta = new HashMap<>();
            meta.put("price", f.getPrice());
            meta.put("from", f.getFrom());
            meta.put("to", f.getTo());
            rec.setMetadata(meta);
            rec.setCreatedAt(DTF.format(LocalDateTime.now()));
            recs.add(rec);
        }

        // Popular hotels
        List<Hotel> allHotels = hotelRepository.findAll();
        for (Hotel h : allHotels.subList(0, Math.min(4, allHotels.size()))) {
            Recommendation rec = new Recommendation();
            rec.setUserEmail(userEmail);
            rec.setEntityType("Hotel");
            rec.setEntityId(h.getId());
            rec.setEntityName(h.getHotelName());
            rec.setReason("Popular choice! Travelers love " + h.getHotelName() + ".");
            rec.setReasonCategory("popular");
            rec.setScore(0.45 * categoryBoost.getOrDefault("popular", 1.0));
            rec.setImageUrl("https://picsum.photos/seed/poph" + h.getId() + "/400/250");
            Map<String, Object> meta = new HashMap<>();
            meta.put("pricePerNight", h.getPricePerNight());
            meta.put("location", h.getLocation());
            rec.setMetadata(meta);
            rec.setCreatedAt(DTF.format(LocalDateTime.now()));
            recs.add(rec);
        }

        return recs;
    }

    private Map<String, Double> calculateCategoryBoosts(List<RecommendationFeedback> feedbackList) {
        Map<String, Double> boosts = new HashMap<>();
        boosts.put("destination_preference", 1.0);
        boosts.put("price_range", 1.0);
        boosts.put("high_rating", 1.0);
        boosts.put("collaborative", 1.0);
        boosts.put("popular", 1.0);

        // For each feedback, look up the recommendation's category and adjust
        for (RecommendationFeedback fb : feedbackList) {
            recommendationRepository.findById(fb.getRecommendationId()).ifPresent(rec -> {
                String category = rec.getReasonCategory();
                if (category != null) {
                    if ("helpful".equals(fb.getFeedbackType())) {
                        boosts.merge(category, 0.1, Double::sum); // boost
                    } else if ("irrelevant".equals(fb.getFeedbackType())) {
                        boosts.merge(category, -0.1, Double::sum); // demote
                    }
                }
            });
        }

        // Clamp values between 0.3 and 2.0
        boosts.replaceAll((k, v) -> Math.max(0.3, Math.min(2.0, v)));
        return boosts;
    }
}
