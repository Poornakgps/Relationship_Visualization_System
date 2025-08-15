package com.flagright.service;

import com.flagright.model.entity.User;
import com.flagright.model.entity.UserConnection;
import com.flagright.model.dto.UserConnectionDto;
import com.flagright.Repository.UserConnectionRepository;
import com.flagright.Repository.UserRepository;
import com.flagright.exception.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {
    
    private final UserRepository userRepository;
    private final UserConnectionRepository userConnectionRepository;
    private final RelationshipDetectionService relationshipDetectionService;

    /** Creates a new user */
    public User createUser(User user) {
        log.info("Creating new user with email: {}", user.getEmail());

        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());

        if (existingUser.isPresent()) {
            throw new IllegalArgumentException("User with email already exists: " + user.getEmail());
        }

        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        relationshipDetectionService.detectUserRelationships(savedUser);

        log.info("User created successfully with ID: {}", savedUser.getId());
        return savedUser;
    }

    /** Updates user information */
    public User updateUser(Long userId, User userUpdates) {
        log.info("Updating user with ID: {}", userId);

        User existingUser = getUserById(userId);

        if (userUpdates.getFirstName() != null) {
            existingUser.setFirstName(userUpdates.getFirstName());
        }
        if (userUpdates.getLastName() != null) {
            existingUser.setLastName(userUpdates.getLastName());
        }
        if (userUpdates.getPhone() != null) {
            existingUser.setPhone(userUpdates.getPhone());
        }
        if (userUpdates.getAddress() != null) {
            existingUser.setAddress(userUpdates.getAddress());
        }

        existingUser.setUpdatedAt(LocalDateTime.now());
        
        User updatedUser = userRepository.save(existingUser);

        relationshipDetectionService.detectUserRelationships(updatedUser);

        return updatedUser;
    }

    /** Gets user by ID */
    @Transactional(readOnly = true)
    public User getUserById(Long userId) {
        log.info("Fetching user with id "+ userId);
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
    }

    /** Gets all users */
    @Transactional(readOnly=true)
    public List<User> getAllUsers() {
        log.info("Fetching all users");
        return userRepository.findAll();
    }

    /** Gets user connections with relationship details */
    @Transactional(readOnly = true)
    public List<UserConnectionDto> getUserConnections(Long userId) {
        log.info("Fetching connections for userId: " + userId);
        getUserById(userId);
        
        List<UserConnection> connections = userConnectionRepository.findByUserId1OrUserId2(userId, userId);
        
        Map<Long, UserConnectionDto> groupedConnections = new HashMap<>();
        
        for (UserConnection conn : connections) {
            Long connectedUserId = conn.getUserId1().equals(userId) ? conn.getUserId2() : conn.getUserId1();
            User connectedUser = userRepository.findById(connectedUserId).orElse(null);
            
            if (connectedUser != null) {
                UserConnectionDto dto = groupedConnections.get(connectedUserId);
                
                if (dto == null) {
                    dto = new UserConnectionDto(
                        connectedUser, 
                        conn.getRelationshipType(), 
                        conn.getSharedValue(),
                        conn.getCreatedAt()
                    );
                    groupedConnections.put(connectedUserId, dto);
                } else {
                    dto.addRelationship(
                        conn.getRelationshipType(), 
                        conn.getSharedValue(),
                        conn.getCreatedAt()
                    );
                }
            }
        }
        
        return new ArrayList<>(groupedConnections.values());
    }

    /** Finds user by email */
    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /** Searches users by first name */
    @Transactional(readOnly = true)
    public List<User> searchUsers(String searchTerm) {
        log.info("Searching users with term: " + searchTerm);
        
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllUsers();
        }
        
        return userRepository.findByFirstNameContainingIgnoreCase(searchTerm.trim());
    }

}
