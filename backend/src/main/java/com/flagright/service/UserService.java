package com.flagright.service;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flagright.Repository.UserConnectionRepository;
import com.flagright.Repository.UserRepository;
import com.flagright.exception.UserNotFoundException;
import com.flagright.model.dto.UserConnectionDto;
import com.flagright.model.entity.User;
import com.flagright.model.entity.UserConnection;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final UserConnectionRepository userConnectionRepository;
    private final RelationshipDetectionService relationshipDetectionService;
    
    public User createUser(User user){

        Optional<User> existinguser = userRepository.findByEmail(user.getEmail());

        if(existinguser.isPresent()){
            throw new IllegalArgumentException("User with email already exists: " + user.getEmail());
        }
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);


        return savedUser;
    }

    public User updateUser(Long userId, User userUpdates){

        User existingUser = getUserById(userId);

        if (userUpdates.getFirstName() != null && userUpdates.getFirstName() != existingUser.getFirstName()) {
            existingUser.setFirstName(userUpdates.getFirstName());
        }
        if (userUpdates.getLastName() != null && userUpdates.getLastName() != existingUser.getLastName()) {
            existingUser.setLastName(userUpdates.getLastName());
        }
        if (userUpdates.getPhone() != null && userUpdates.getPhone() != existingUser.getPhone()) {
            existingUser.setPhone(userUpdates.getPhone());
        }
        if (userUpdates.getAddress() != null && userUpdates.getAddress() != existingUser.getAddress()) {
            existingUser.setAddress(userUpdates.getAddress());
        }

        existingUser.setUpdatedAt(LocalDateTime.now());
        
        User updatedUser = userRepository.save(existingUser);

        relationshipDetectionService.detectUserRelationships(updatedUser);

        return updatedUser;
    }

    @Transactional(readOnly = true)
    public User getUserById(Long userId) {
        log.info("Fetching user with id "+ userId);
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
    }

    @Transactional(readOnly=true)
    public List<User> getAllUsers() {
        log.info("Fetching all users");
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<UserConnectionDto> getUserConnections(Long userId) {
        log.info("Fetching connections for userId: " + userId);
        getUserById(userId);

        List<UserConnection> connections = userConnectionRepository.findByUserId1OrUserId2(userId, userId);
        
        return connections.stream().map(conn -> {
            Long connectedUserId = conn.getUserId1().equals(userId) ? conn.getUserId2() : conn.getUserId1();
            User connectedUser = userRepository.findById(connectedUserId).orElse(null);
            
            if (connectedUser != null) {
                return new UserConnectionDto(
                    connectedUser, 
                    conn.getRelationshipType(), 
                    conn.getSharedValue(),
                    conn.getCreatedAt()
                );
            }
            return null;
        }).filter(dto -> dto != null).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Transactional(readOnly = true)
    public List<User> searchUsers(String searchTerm) {
        
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllUsers();
        }
        
        return userRepository.findByFirstNameContainingIgnoreCase(searchTerm.trim());
    }

}

