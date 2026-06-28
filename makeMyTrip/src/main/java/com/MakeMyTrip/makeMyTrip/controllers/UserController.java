package com.MakeMyTrip.makeMyTrip.controllers;

import com.MakeMyTrip.makeMyTrip.models.Users;
import com.MakeMyTrip.makeMyTrip.services.UserServices;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:3000") // Allow requests from Next.js frontend
public class UserController {
    @Autowired
    private UserServices userServices;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private Environment env;

    @GetMapping("/db")
    public void checkDb() {
        System.out.println("URI (old key) = " + env.getProperty("spring.data.mongodb.uri"));
        System.out.println("URI (new key) = " + env.getProperty("spring.mongodb.uri"));
        System.out.println("Connected DB = " + mongoTemplate.getDb().getName());
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");
        Users user = userServices.login(email, password);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }
    }

    @PostMapping( "/signup")
    public ResponseEntity<?> signup(@RequestBody Users user) {
        try {
            return ResponseEntity.ok(userServices.signup(user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/email")
    public ResponseEntity<Users> getUserByEmail(@RequestParam String email) {
        Users user = userServices.getUserByEmail(email);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/edit")
    public  Users editprofile( @RequestParam String id , @RequestParam  Users updateUser){
        return userServices.editProfile(id , updateUser) ;
    }

}
