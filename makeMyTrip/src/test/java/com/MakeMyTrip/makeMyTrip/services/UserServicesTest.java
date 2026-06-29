package com.MakeMyTrip.makeMyTrip.services;

import com.MakeMyTrip.makeMyTrip.models.Users;
import com.MakeMyTrip.makeMyTrip.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
public class UserServicesTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServices userServices;

    private Users testUser;

    @BeforeEach
    void setUp() {
        testUser = new Users();
        testUser.set_id("user123");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setEmail("john.doe@example.com");
        testUser.setPassword("encodedpassword");
        testUser.setRole("USER");
    }

    @Test
    void login_Success() {
        Mockito.when(userRepository.findByEmail("john.doe@example.com")).thenReturn(testUser);
        Mockito.when(passwordEncoder.matches("securepassword", "encodedpassword")).thenReturn(true);

        Users result = userServices.login("john.doe@example.com", "securepassword");

        assertNotNull(result);
        assertEquals("john.doe@example.com", result.getEmail());
    }

    @Test
    void login_Failure_WrongPassword() {
        Mockito.when(userRepository.findByEmail("john.doe@example.com")).thenReturn(testUser);
        Mockito.when(passwordEncoder.matches("wrongpassword", "encodedpassword")).thenReturn(false);

        Users result = userServices.login("john.doe@example.com", "wrongpassword");

        assertNull(result);
    }

    @Test
    void signup_Success() {
        Mockito.when(userRepository.findByEmail("john.doe@example.com")).thenReturn(null);
        Mockito.when(passwordEncoder.encode("rawpassword")).thenReturn("encodedpassword");
        Mockito.when(userRepository.save(any(Users.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Users newUser = new Users();
        newUser.setEmail("john.doe@example.com");
        newUser.setPassword("rawpassword");
        newUser.setFirstName("John");
        newUser.setLastName("Doe");

        Users result = userServices.signup(newUser);

        assertNotNull(result);
        assertEquals("encodedpassword", result.getPassword());
        assertEquals("USER", result.getRole());
    }

    @Test
    void signup_Failure_UserAlreadyExists() {
        Mockito.when(userRepository.findByEmail("john.doe@example.com")).thenReturn(testUser);

        Users newUser = new Users();
        newUser.setEmail("john.doe@example.com");

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userServices.signup(newUser);
        });

        assertTrue(exception.getMessage().contains("User already exists with this email"));
    }
}
