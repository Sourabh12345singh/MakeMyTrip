package com.MakeMyTrip.makeMyTrip.services;

import com.MakeMyTrip.makeMyTrip.models.*;
import com.MakeMyTrip.makeMyTrip.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ReviewReplyRepository reviewReplyRepository;

    @Autowired
    private ReviewFlagRepository reviewFlagRepository;

    @Autowired
    private ReviewVoteRepository reviewVoteRepository;

    @Autowired
    private FileStorageService fileStorageService;

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public Review createReview(String entityType, String entityId, String userEmail, String userName,
                               int rating, String title, String description,
                               List<MultipartFile> images) {
        Review review = new Review();
        review.setEntityType(entityType);
        review.setEntityId(entityId);
        review.setUserEmail(userEmail);
        review.setUserName(userName);
        review.setRating(rating);
        review.setTitle(title);
        review.setDescription(description);
        review.setHelpfulCount(0);
        review.setCreatedAt(DATE_TIME_FORMATTER.format(LocalDateTime.now()));
        review.setUpdatedAt(DATE_TIME_FORMATTER.format(LocalDateTime.now()));

        if (images != null && !images.isEmpty()) {
            List<String> imageUrls = images.stream()
                .filter(file -> !file.isEmpty())
                .map(file -> fileStorageService.saveFile(file))
                .toList();
            review.setImageUrls(imageUrls);
        }

        return reviewRepository.save(review);
    }

    public Review getReviewById(String reviewId) {
        return reviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Review not found"));
    }

    public List<Review> getReviewsByEntityId(String entityType, String entityId) {
        return reviewRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId);
    }

    public List<Review> getReviewsByEntityIdSorted(String entityType, String entityId, String sortBy) {
        switch (sortBy) {
            case "most_helpful":
                return reviewRepository.findByEntityTypeAndEntityIdOrderByHelpfulCountDesc(entityType, entityId);
            case "highest_rated":
                return reviewRepository.findByEntityTypeAndEntityIdOrderByRatingDesc(entityType, entityId);
            case "lowest_rated":
                return reviewRepository.findByEntityTypeAndEntityIdOrderByRatingAsc(entityType, entityId);
            default:
                return reviewRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId);
        }
    }

    public ReviewReply addReply(String reviewId, String userEmail, String userName, String text) {
        Review review = getReviewById(reviewId);
        ReviewReply reply = new ReviewReply();
        reply.setReviewId(reviewId);
        reply.setUserEmail(userEmail);
        reply.setUserName(userName);
        reply.setText(text);
        reply.setCreatedAt(DATE_TIME_FORMATTER.format(LocalDateTime.now()));
        return reviewReplyRepository.save(reply);
    }

    public List<ReviewReply> getRepliesByReviewId(String reviewId) {
        return reviewReplyRepository.findByReviewIdOrderByCreatedAtAsc(reviewId);
    }

    public ReviewFlag flagReview(String reviewId, String flaggedByEmail, String reason) {
        Review review = getReviewById(reviewId);
        ReviewFlag flag = new ReviewFlag();
        flag.setReviewId(reviewId);
        flag.setFlaggedByEmail(flaggedByEmail);
        flag.setReason(reason);
        flag.setStatus(ReviewFlagStatus.PENDING);
        flag.setCreatedAt(DATE_TIME_FORMATTER.format(LocalDateTime.now()));
        return reviewFlagRepository.save(flag);
    }

    public List<Review> getPendingFlags() {
        return reviewRepository.findAll().stream()
            .filter(review -> reviewFlagRepository.findByReviewId(review.getId()).stream()
                .anyMatch(flag -> flag.getStatus().equals(ReviewFlagStatus.PENDING)))
            .toList();
    }

    public Review resolveFlag(String flagId, String action, String resolvedBy) {
        ReviewFlag flag = reviewFlagRepository.findById(flagId)
            .orElseThrow(() -> new RuntimeException("Flag not found"));

        Review review = reviewRepository.findById(flag.getReviewId())
            .orElseThrow(() -> new RuntimeException("Review not found"));

        if ("RESOLVE".equals(action)) {
            flag.setStatus(ReviewFlagStatus.RESOLVED);
            reviewFlagRepository.save(flag);
        } else if ("REMOVE".equals(action)) {
            flag.setStatus(ReviewFlagStatus.DISMISSED);
            reviewFlagRepository.save(flag);

            if (review.getImageUrls() != null) {
                review.getImageUrls().forEach(fileStorageService::deleteFile);
            }

            deleteReviewAndReplies(flag.getReviewId());
            return null;
        }

        return review;
    }

    public ReviewVote voteOnReview(String reviewId, String userEmail, String voteType) {
        if (reviewVoteRepository.existsByReviewIdAndUserEmail(reviewId, userEmail)) {
            throw new RuntimeException("User has already voted on this review");
        }

        ReviewVote vote = new ReviewVote();
        vote.setReviewId(reviewId);
        vote.setUserEmail(userEmail);
        vote.setType(voteType);
        vote.setCreatedAt(DATE_TIME_FORMATTER.format(LocalDateTime.now()));

        ReviewVote savedVote = reviewVoteRepository.save(vote);

        if (ReviewVoteType.HELPFUL.equals(voteType)) {
            Review review = getReviewById(reviewId);
            review.setHelpfulCount(reviewVoteRepository.countByReviewId(reviewId) + 1);
            reviewRepository.save(review);
        }

        return savedVote;
    }

    public List<ReviewVote> getUserVotesByEmail(String userEmail) {
        return reviewRepository.findByUserEmail(userEmail).stream()
            .flatMap(review -> reviewVoteRepository.findAll().stream()
                .filter(vote -> vote.getReviewId().equals(review.getId()))
                .filter(vote -> vote.getUserEmail().equals(userEmail)))
            .toList();
    }

    public String getVoteTypeByReviewAndUser(String reviewId, String userEmail) {
        ReviewVote vote = reviewVoteRepository.findByReviewIdAndUserEmail(reviewId, userEmail);
        return vote != null ? vote.getType() : null;
    }

    public boolean existsUserVoteOnReview(String reviewId, String userEmail) {
        return reviewVoteRepository.existsByReviewIdAndUserEmail(reviewId, userEmail);
    }

    public Review updateReview(String reviewId, String title, String description, int rating) {
        Review review = getReviewById(reviewId);
        review.setTitle(title);
        review.setDescription(description);
        review.setRating(rating);
        review.setUpdatedAt(DATE_TIME_FORMATTER.format(LocalDateTime.now()));
        return reviewRepository.save(review);
    }

    public void deleteReviewAndReplies(String reviewId) {
        List<ReviewReply> replies = reviewReplyRepository.findByReviewIdOrderByCreatedAtAsc(reviewId);
        reviewReplyRepository.deleteAll(replies);
        List<ReviewFlag> flags = reviewFlagRepository.findByReviewId(reviewId);
        reviewFlagRepository.deleteAll(flags);
        reviewVoteRepository.deleteAll(
            reviewVoteRepository.findAll().stream()
                .filter(v -> v.getReviewId().equals(reviewId))
                .toList()
        );
        reviewRepository.deleteById(reviewId);
    }
}
