package com.MakeMyTrip.makeMyTrip.controllers;

import com.MakeMyTrip.makeMyTrip.models.Recommendation;
import com.MakeMyTrip.makeMyTrip.models.RecommendationFeedback;
import com.MakeMyTrip.makeMyTrip.services.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @GetMapping("/{userEmail}")
    public ResponseEntity<List<Recommendation>> getRecommendations(@PathVariable String userEmail) {
        List<Recommendation> recs = recommendationService.getRecommendations(userEmail);
        return ResponseEntity.ok(recs);
    }

    @PostMapping("/generate/{userEmail}")
    public ResponseEntity<List<Recommendation>> generateRecommendations(@PathVariable String userEmail) {
        List<Recommendation> recs = recommendationService.generateRecommendations(userEmail);
        return ResponseEntity.ok(recs);
    }

    @PostMapping("/feedback")
    public ResponseEntity<RecommendationFeedback> submitFeedback(
            @RequestParam String recommendationId,
            @RequestParam String userEmail,
            @RequestParam String feedbackType) {
        RecommendationFeedback fb = recommendationService.submitFeedback(recommendationId, userEmail, feedbackType);
        return ResponseEntity.ok(fb);
    }
}
