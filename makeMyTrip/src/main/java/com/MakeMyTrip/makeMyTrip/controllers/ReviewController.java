package com.MakeMyTrip.makeMyTrip.controllers;

import com.MakeMyTrip.makeMyTrip.models.Review;
import com.MakeMyTrip.makeMyTrip.models.ReviewReply;
import com.MakeMyTrip.makeMyTrip.models.ReviewFlag;
import com.MakeMyTrip.makeMyTrip.models.ReviewVote;
import com.MakeMyTrip.makeMyTrip.services.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping(value = "/", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Review> createReview(
            @RequestParam("entityType") String entityType,
            @RequestParam("entityId") String entityId,
            @RequestParam("userEmail") String userEmail,
            @RequestParam("userName") String userName,
            @RequestParam("rating") int rating,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {

        Review review = reviewService.createReview(
            entityType, entityId, userEmail, userName, rating, title, description, images);
        return ResponseEntity.ok(review);
    }

    @GetMapping("/{reviewId}")
    public ResponseEntity<Review> getReview(@PathVariable String reviewId) {
        Review review = reviewService.getReviewById(reviewId);
        return ResponseEntity.ok(review);
    }

    @GetMapping("/{entityType}/{entityId}")
    public ResponseEntity<List<Review>> getReviews(
            @PathVariable String entityType,
            @PathVariable String entityId,
            @RequestParam(value = "sortBy", defaultValue = "newest") String sortBy) {
        List<Review> reviews = reviewService.getReviewsByEntityIdSorted(entityType, entityId, sortBy);
        return ResponseEntity.ok(reviews);
    }

    @PostMapping("/{reviewId}/replies")
    public ResponseEntity<ReviewReply> addReply(
            @PathVariable String reviewId,
            @RequestParam("userEmail") String userEmail,
            @RequestParam("userName") String userName,
            @RequestParam("text") String text) {
        ReviewReply reply = reviewService.addReply(reviewId, userEmail, userName, text);
        return ResponseEntity.ok(reply);
    }

    @GetMapping("/{reviewId}/replies")
    public ResponseEntity<List<ReviewReply>> getReplies(@PathVariable String reviewId) {
        List<ReviewReply> replies = reviewService.getRepliesByReviewId(reviewId);
        return ResponseEntity.ok(replies);
    }

    @PostMapping("/{reviewId}/flags")
    public ResponseEntity<ReviewFlag> flagReview(
            @PathVariable String reviewId,
            @RequestParam("flaggedByEmail") String flaggedByEmail,
            @RequestParam("reason") String reason) {
        ReviewFlag flag = reviewService.flagReview(reviewId, flaggedByEmail, reason);
        return ResponseEntity.ok(flag);
    }

    @GetMapping("/flags/pending")
    public ResponseEntity<List<Review>> getPendingFlags() {
        List<Review> reviews = reviewService.getPendingFlags();
        return ResponseEntity.ok(reviews);
    }

    @PutMapping("/flags/{flagId}/resolve")
    public ResponseEntity<?> resolveFlag(
            @PathVariable String flagId,
            @RequestParam("action") String action,
            @RequestParam("resolvedBy") String resolvedBy) {
        Review review = reviewService.resolveFlag(flagId, action, resolvedBy);
        if (review == null) {
            return ResponseEntity.ok(Map.of("message", "Review removed successfully"));
        }
        return ResponseEntity.ok(review);
    }

    @PostMapping("/{reviewId}/votes")
    public ResponseEntity<ReviewVote> voteOnReview(
            @PathVariable String reviewId,
            @RequestParam("userEmail") String userEmail,
            @RequestParam("type") String type) {
        ReviewVote vote = reviewService.voteOnReview(reviewId, userEmail, type);
        return ResponseEntity.ok(vote);
    }

    @GetMapping("/{reviewId}/votes/{userEmail}")
    public ResponseEntity<String> getVoteType(
            @PathVariable String reviewId,
            @PathVariable String userEmail) {
        String voteType = reviewService.getVoteTypeByReviewAndUser(reviewId, userEmail);
        return ResponseEntity.ok(voteType);
    }

    @GetMapping("/{reviewId}/votes/exists/{userEmail}")
    public ResponseEntity<Boolean> existsUserVoteOnReview(
            @PathVariable String reviewId,
            @PathVariable String userEmail) {
        boolean exists = reviewService.existsUserVoteOnReview(reviewId, userEmail);
        return ResponseEntity.ok(exists);
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<Review> updateReview(
            @PathVariable String reviewId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("rating") int rating) {
        Review review = reviewService.updateReview(reviewId, title, description, rating);
        return ResponseEntity.ok(review);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable String reviewId) {
        reviewService.deleteReviewAndReplies(reviewId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/seed/{entityType}/{entityId}")
    public ResponseEntity<List<Review>> seedDemoReviews(
            @PathVariable String entityType,
            @PathVariable String entityId) {

        String[][] reviewsData = {
            {"Rajesh Kumar", "rajesh@demo.com", "5", "Absolutely Wonderful!", "Had an amazing experience. The service was top-notch and everything exceeded my expectations. Would definitely recommend to everyone!"},
            {"Priya Sharma", "priya@demo.com", "4", "Great Experience Overall", "Really enjoyed the journey. A few minor things could be improved, but overall a fantastic experience. Value for money."},
            {"Amit Patel", "amit@demo.com", "3", "Decent but Room for Improvement", "The experience was okay. Some aspects were good but others need significant improvement. Average overall."},
            {"Sneha Gupta", "sneha@demo.com", "5", "Best Experience Ever!", "Exceeded all expectations! The quality was outstanding and the staff was incredibly helpful. A 5-star experience through and through."},
            {"Vikram Singh", "vikram@demo.com", "2", "Below Expectations", "Was expecting much more based on the reviews. The experience was underwhelming and didn't justify the price paid."}
        };

        List<Review> seeded = new java.util.ArrayList<>();
        for (String[] data : reviewsData) {
            Review r = reviewService.createReview(entityType, entityId, data[1], data[0],
                Integer.parseInt(data[2]), data[3], data[4], null);
            seeded.add(r);
        }

        // Add demo replies to first review
        if (!seeded.isEmpty()) {
            reviewService.addReply(seeded.get(0).getId(), "meera@demo.com", "Meera Joshi", "Totally agree! I had a similar experience.");
            reviewService.addReply(seeded.get(0).getId(), "arjun@demo.com", "Arjun Reddy", "Thanks for the detailed review. Very helpful!");
            reviewService.addReply(seeded.get(1).getId(), "kavita@demo.com", "Kavita Nair", "I second this. Great value for the price.");
        }

        return ResponseEntity.ok(seeded);
    }
}
