package com.flagright.Repository;

import com.flagright.model.entity.Transaction;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends Neo4jRepository<Transaction, Long> {

    /**
     * Finds all transactions with a specific status
     * @param status The transaction status to search for
     * @return List of transactions matching the status
     */
    List<Transaction> findByStatus(String status);
    
    /**
     * Finds all transactions with amount greater than specified threshold
     * @param amount The minimum amount threshold
     * @return List of transactions with amount greater than the threshold
     */
    List<Transaction> findByAmountGreaterThan(BigDecimal amount);
    
    /**
     * Finds all transactions created within a date range
     * @param start The start date/time
     * @param end The end date/time
     * @return List of transactions created between start and end dates
     */
    List<Transaction> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    /**
     * Creates graph relationships between transactions that share the same device ID
     * Uses Cypher query to merge SAME_DEVICE relationships in Neo4j
     */
    @Query("MATCH (t1:Transaction), (t2:Transaction) " +
           "WHERE t1.deviceId IS NOT NULL AND t2.deviceId IS NOT NULL " +
           "AND t1.deviceId = t2.deviceId AND t1.id <> t2.id " +
           "MERGE (t1)-[:SAME_DEVICE]-(t2)")
    void createDeviceConnections();
    
    /**
     * Creates graph relationships between transactions that share the same IP address
     * Uses Cypher query to merge SAME_IP relationships in Neo4j
     */
    @Query("MATCH (t1:Transaction), (t2:Transaction) " +
           "WHERE t1.ipAddress IS NOT NULL AND t2.ipAddress IS NOT NULL " +
           "AND t1.ipAddress = t2.ipAddress AND t1.id <> t2.id " +
           "MERGE (t1)-[:SAME_IP]-(t2)")
    void createIpConnections();
    
    /**
     * Creates graph relationships between transactions that share the same payment method
     * Uses Cypher query to merge SAME_PAYMENT_METHOD relationships in Neo4j
     */
    @Query("MATCH (t1:Transaction), (t2:Transaction) " +
           "WHERE t1.paymentMethod IS NOT NULL AND t2.paymentMethod IS NOT NULL " +
           "AND t1.paymentMethod = t2.paymentMethod AND t1.id <> t2.id " +
           "MERGE (t1)-[:SAME_PAYMENT_METHOD]-(t2)")
    void createPaymentMethodConnections();
    
    /**
     * Finds all transactions sent by a specific user
     * @param userId The ID of the user who sent the transactions
     * @return List of transactions sent by the user, ordered by creation date descending
     */
    @Query("MATCH (u:User)-[:SENT]-(t:Transaction) WHERE u.id = $userId RETURN t ORDER BY t.createdAt DESC")
    List<Transaction> findTransactionsBySender(@Param("userId") Long userId);
    
    /**
     * Finds all transactions received by a specific user
     * @param userId The ID of the user who received the transactions
     * @return List of transactions received by the user, ordered by creation date descending
     */
    @Query("MATCH (u:User)-[:RECEIVED]-(t:Transaction) WHERE u.id = $userId RETURN t ORDER BY t.createdAt DESC")
    List<Transaction> findTransactionsByRecipient(@Param("userId") Long userId);

    /**
     * Creates a SENT relationship between a user and a transaction
     * @param senderId The ID of the user who sent the transaction
     * @param transactionId The ID of the transaction
     */
    @Query("MATCH (u:User), (t:Transaction) " +
           "WHERE u.id = $senderId AND t.id = $transactionId " +
           "MERGE (u)-[:SENT]->(t)")
    void createSentRelationship(@Param("senderId") Long senderId, @Param("transactionId") Long transactionId);
    
    /**
     * Creates a RECEIVED relationship between a transaction and a user
     * @param recipientId The ID of the user who received the transaction
     * @param transactionId The ID of the transaction
     */
    @Query("MATCH (u:User), (t:Transaction) " +
           "WHERE u.id = $recipientId AND t.id = $transactionId " +
           "MERGE (t)-[:RECEIVED]->(u)")
    void createReceivedRelationship(@Param("recipientId") Long recipientId, @Param("transactionId") Long transactionId);

}
