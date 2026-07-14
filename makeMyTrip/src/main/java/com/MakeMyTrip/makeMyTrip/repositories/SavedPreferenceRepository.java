package com.MakeMyTrip.makeMyTrip.repositories;

import com.MakeMyTrip.makeMyTrip.models.SavedPreference;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface SavedPreferenceRepository extends MongoRepository<SavedPreference, String> {
    List<SavedPreference> findByUserEmail(String userEmail);
    void deleteByUserEmailAndType(String userEmail, String type);
}
