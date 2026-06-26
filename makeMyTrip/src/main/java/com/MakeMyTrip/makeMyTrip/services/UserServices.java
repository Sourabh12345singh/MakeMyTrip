package com.MakeMyTrip.makeMyTrip.services;

import com.MakeMyTrip.makeMyTrip.models.Users;
import com.MakeMyTrip.makeMyTrip.repositories.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class UserServices {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;


    public Users login(String email , String password) {
        Users user = userRepository.findByEmail(email);
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            return user;
        }
        return null;
    }

    public Users signup(Users user) {
        // Check if the user already exists
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw  new RuntimeException( " User already exists with this email");
//            throw new UserAlreadyExistsException("Email is already registered");
        }
        user.setPassword( passwordEncoder.encode(user.getPassword()));
        if( user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        }
        Users savedUser = userRepository.save(user);

        System.out.println(savedUser); //comment out

        return savedUser;
    }

    public Users getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Users editProfile( String email , Users updatedUser) {
        Users existingUser = userRepository.findByEmail(email);
        if (existingUser != null) {
            existingUser.setFirstName(updatedUser.getFirstName());
            existingUser.setLastName(updatedUser.getLastName());
            existingUser.setPhoneNumber(updatedUser.getPhoneNumber());
            // Update other fields as needed
            return userRepository.save(existingUser);
        }
        return null;
    }


}
