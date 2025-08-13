package com.flagright.model.dto;

import com.flagright.model.entity.Transaction;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionConnectionDto {
    private Transaction transaction;
    private String relationshipType;
    private String sharedValue;
    private LocalDateTime createdAt;
    private Double connectionStrength;
    
    public TransactionConnectionDto(Transaction transaction, String relationshipType, String sharedValue) {
        this.transaction = transaction;
        this.relationshipType = relationshipType;
        this.sharedValue = sharedValue;
        this.createdAt = LocalDateTime.now();
        this.connectionStrength = calculateConnectionStrength(relationshipType);
    }
    
    public TransactionConnectionDto(Transaction transaction, String relationshipType, String sharedValue, LocalDateTime createdAt) {
        this.transaction = transaction;
        this.relationshipType = relationshipType;
        this.sharedValue = sharedValue;
        this.createdAt = createdAt;
        this.connectionStrength = calculateConnectionStrength(relationshipType);
    }
    
    private Double calculateConnectionStrength(String relationshipType) {
        switch (relationshipType) {
            case "SAME_DEVICE":
                return 0.9; 
            case "SAME_IP":
                return 0.7; 
            case "SAME_PAYMENT_METHOD":
                return 0.6; 
            default:
                return 0.5;
        }
    }
} 