package com.MakeMyTrip.makeMyTrip.controllers;

import com.MakeMyTrip.makeMyTrip.models.Users;
import com.MakeMyTrip.makeMyTrip.services.UserServices;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class UserControllerTest {

    @Mock
    private UserServices userServices;

    @InjectMocks
    private UserController userController;

    private Users testUser;

    @BeforeEach
    void setUp() {
        testUser = new Users();
        testUser.set_id("user123");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setEmail("john.doe@example.com");
        testUser.setRole("USER");
    }

    @Test
    void signup_Success() {
        Mockito.when(userServices.signup(Mockito.any(Users.class))).thenReturn(testUser);

        ResponseEntity<?> response = userController.signup(testUser);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        Users returnedUser = (Users) response.getBody();
        assertNotNull(returnedUser);
        assertEquals("john.doe@example.com", returnedUser.getEmail());
    }

    @Test
    void login_Success() {
        Mockito.when(userServices.login("john.doe@example.com", "securepassword")).thenReturn(testUser);

        ResponseEntity<?> response = userController.login(Map.of(
                "email", "john.doe@example.com",
                "password", "securepassword"
        ));

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        Users returnedUser = (Users) response.getBody();
        assertNotNull(returnedUser);
        assertEquals("USER", returnedUser.getRole());
    }

    @Test
    void login_Failure() {
        Mockito.when(userServices.login("john.doe@example.com", "wrongpassword")).thenReturn(null);

        ResponseEntity<?> response = userController.login(Map.of(
                "email", "john.doe@example.com",
                "password", "wrongpassword"
        ));

        assertNotNull(response);
        assertEquals(401, response.getStatusCode().value());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertNotNull(body);
        assertEquals("Invalid email or password", body.get("message"));
    }
}
