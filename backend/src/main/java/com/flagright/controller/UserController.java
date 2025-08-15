
package com.flagright.controller;

import com.flagright.model.entity.User;
import com.flagright.model.dto.CreateUserRequest;
import com.flagright.model.dto.UserConnectionDto;
import com.flagright.service.UserService;
import com.flagright.service.RelationshipDetectionService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;
    private final RelationshipDetectionService relationshipDetectionService;

    /** Creates a new user */
    @PostMapping
    public ResponseEntity<User> createUser(@Valid @RequestBody CreateUserRequest request) {
        log.info("Creating user with email: {}", request.getEmail());
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setAddress(request.getAddress());
        user.setDateOfBirth(request.getDateOfBirth());
        
        User createdUser = userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    /** Gets all users */
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        log.info("Fetching all users");
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /** Gets user by ID */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        log.info("Fetching user with ID: {}", id);
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    /** Updates user information */
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userUpdates) {
        log.info("Updating user with ID: {}", id);
        User updatedUser = userService.updateUser(id, userUpdates);
        return ResponseEntity.ok(updatedUser);
    }



    /** Gets user connections */
    @GetMapping("/{id}/connections")
    public ResponseEntity<List<UserConnectionDto>> getUserConnections(@PathVariable Long id) {
        log.info("Fetching connections for user ID: {}", id);
        List<UserConnectionDto> connections = userService.getUserConnections(id);
        return ResponseEntity.ok(connections);
    }

    /** Searches users by name */
    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String term) {
        log.info("Searching users with term: {}", term);
        List<User> users = userService.searchUsers(term);
        return ResponseEntity.ok(users);
    }

    /** Manually triggers relationship detection */
    @PostMapping("/detect-relationships")
    public ResponseEntity<String> detectAllRelationships() {
        log.info("Manually triggering relationship detection");
        relationshipDetectionService.detectAllRelationships();
        return ResponseEntity.ok("Relationship detection completed successfully");
    }
} 