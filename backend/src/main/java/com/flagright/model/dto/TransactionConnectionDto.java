package com.flagright.model.dto;

import com.flagright.model.entity.Transaction;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionConnectionDto {
    private Transaction transaction;
    private List<String> relationshipTypes;
    private Map<String, String> sharedValues;
    private LocalDateTime createdAt;
    
    public TransactionConnectionDto(Transaction transaction, String relationshipType, String sharedValue) {
        this.transaction = transaction;
        this.relationshipTypes = new ArrayList<>();
        this.relationshipTypes.add(relationshipType);
        this.sharedValues = new HashMap<>();
        this.sharedValues.put(relationshipType, sharedValue);
        this.createdAt = LocalDateTime.now();
    }
    
    public TransactionConnectionDto(Transaction transaction, String relationshipType, String sharedValue, LocalDateTime createdAt) {
        this.transaction = transaction;
        this.relationshipTypes = new ArrayList<>();
        this.relationshipTypes.add(relationshipType);
        this.sharedValues = new HashMap<>();
        this.sharedValues.put(relationshipType, sharedValue);
        this.createdAt = createdAt;
    }
    
    public void addRelationship(String relationshipType, String sharedValue, LocalDateTime relationshipCreatedAt) {
        if (this.relationshipTypes == null) {
            this.relationshipTypes = new ArrayList<>();
        }
        if (this.sharedValues == null) {
            this.sharedValues = new HashMap<>();
        }
        
        if (!this.relationshipTypes.contains(relationshipType)) {
            this.relationshipTypes.add(relationshipType);
            this.sharedValues.put(relationshipType, sharedValue);
            
            if (this.createdAt == null || (relationshipCreatedAt != null && relationshipCreatedAt.isBefore(this.createdAt))) {
                this.createdAt = relationshipCreatedAt;
            }
        }
    }
    
    public String getRelationshipTypesAsString() {
        return relationshipTypes != null ? String.join(", ", relationshipTypes) : "";
    }
} 