package com.flagright.model.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.GeneratedValue;

import java.time.LocalDateTime;

@Node("UserConnection")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserConnection {
    
    @Id
    @GeneratedValue
    private Long id;
    
    @Property("userId1")
    private Long userId1;
    
    @Property("userId2")
    private Long userId2;
    
    @Property("relationshipType")
    private String relationshipType; // SHARES_EMAIL, SHARES_PHONE, SHARES_ADDRESS
    
    @Property("sharedValue")
    private String sharedValue; // shared value between two users
    
    @Property("createdAt")
    private LocalDateTime createdAt;
    
    public UserConnection(Long userId1, Long userId2, String relationshipType, String sharedValue) {
        this.userId1 = userId1;
        this.userId2 = userId2;
        this.relationshipType = relationshipType;
        this.sharedValue = sharedValue;
        this.createdAt = LocalDateTime.now();
    }
} 