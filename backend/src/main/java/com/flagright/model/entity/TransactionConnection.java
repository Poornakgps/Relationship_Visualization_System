package com.flagright.model.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.GeneratedValue;

import java.time.LocalDateTime;

@Node("TransactionConnection")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionConnection {
    
    @Id
    @GeneratedValue
    private Long id;
    
    @Property("transactionId1")
    private Long transactionId1;
    
    @Property("transactionId2")
    private Long transactionId2;
    
    @Property("relationshipType")
    private String relationshipType;
    
    @Property("sharedValue")
    private String sharedValue;
    
    @Property("createdAt")
    private LocalDateTime createdAt;
    
    public TransactionConnection(Long transactionId1, Long transactionId2, String relationshipType, String sharedValue) {
        this.transactionId1 = transactionId1;
        this.transactionId2 = transactionId2;
        this.relationshipType = relationshipType;
        this.sharedValue = sharedValue;
        this.createdAt = LocalDateTime.now();
    }
} 