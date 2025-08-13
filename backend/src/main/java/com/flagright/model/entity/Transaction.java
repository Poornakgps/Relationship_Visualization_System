package com.flagright.model.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.Relationship;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Node("Transaction")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Transaction {
    
    @Id
    @GeneratedValue
    @EqualsAndHashCode.Include
    private Long id;

    @Property("amount")
    private BigDecimal amount;

    @Property("currency")
    private String currency;

    @Property("description")
    private String description;

    @Property("ipAddress")
    private String ipAddress;

    @Property("deviceId")
    private String deviceId;

    @Property("paymentMethod")
    private String paymentMethod;

    @Property("status")
    private String status;

    @Property("createdAt")
    private LocalDateTime createdAt;

    @Property("completedAt")
    private LocalDateTime completedAt;

    @Relationship(type = "SENT", direction = Relationship.Direction.INCOMING)
    private User sender;
    
    @Relationship(type = "RECEIVED", direction = Relationship.Direction.OUTGOING)
    private User recipient;
    
    @JsonIgnore
    @Relationship(type = "SAME_DEVICE")
    private Set<Transaction> deviceConnections = new HashSet<>();
    
    @JsonIgnore
    @Relationship(type = "SAME_IP")
    private Set<Transaction> ipConnections = new HashSet<>();
    
    @JsonIgnore
    @Relationship(type = "SAME_PAYMENT_METHOD")
    private Set<Transaction> paymentMethodConnections = new HashSet<>();
}
