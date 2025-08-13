package com.flagright.model.dto;

import com.flagright.model.entity.User;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserConnectionDto {
    private User user;
    private String relationshipType;
    private String sharedValue;
    private LocalDateTime createdAt;
    
    public UserConnectionDto(User user, String relationshipType, String sharedValue) {
        this.user = user;
        this.relationshipType = relationshipType;
        this.sharedValue = sharedValue;
        this.createdAt = LocalDateTime.now();
    }
} 
