package com.flagright.Repository;

import com.flagright.model.entity.TransactionConnection;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionConnectionRepository extends Neo4jRepository<TransactionConnection, Long> {
    
    /**
     * Finds all transaction connections where the specified transaction ID appears as either transactionId1 or transactionId2
     * @param transactionId1 The first transaction ID to search for
     * @param transactionId2 The second transaction ID to search for (typically same as transactionId1)
     * @return List of TransactionConnection entities involving the specified transaction
     */
    List<TransactionConnection> findByTransactionId1OrTransactionId2(Long transactionId1, Long transactionId2);
    
    /**
     * Finds all transaction connections of a specific relationship type
     * @param relationshipType The type of relationship (e.g., SAME_DEVICE, SAME_IP, SAME_PAYMENT_METHOD)
     * @return List of TransactionConnection entities with the specified relationship type
     */
    List<TransactionConnection> findByRelationshipType(String relationshipType);
    
    /**
     * Checks if a transaction connection already exists between two transactions with a specific relationship type
     * @param transactionId1 The ID of the first transaction
     * @param transactionId2 The ID of the second transaction
     * @param relationshipType The type of relationship to check for
     * @return True if the connection exists, false otherwise
     */
    boolean existsByTransactionId1AndTransactionId2AndRelationshipType(Long transactionId1, Long transactionId2, String relationshipType);
    
    /**
     * Deletes all transaction connections where the specified transaction ID appears as either transactionId1 or transactionId2
     * @param transactionId1 The first transaction ID to delete connections for
     * @param transactionId2 The second transaction ID to delete connections for (typically same as transactionId1)
     */
    void deleteByTransactionId1OrTransactionId2(Long transactionId1, Long transactionId2);
} 