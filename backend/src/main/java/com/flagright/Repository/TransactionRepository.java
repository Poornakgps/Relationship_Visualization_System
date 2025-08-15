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

    List<Transaction> findByStatus(String status);
    
    List<Transaction> findByAmountGreaterThan(BigDecimal amount);
    
    List<Transaction> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    @Query("MATCH (t1:Transaction), (t2:Transaction) " +
           "WHERE t1.deviceId IS NOT NULL AND t2.deviceId IS NOT NULL " +
           "AND t1.deviceId = t2.deviceId AND t1.id <> t2.id " +
           "MERGE (t1)-[:SAME_DEVICE]-(t2)")
    void createDeviceConnections();
    
    @Query("MATCH (t1:Transaction), (t2:Transaction) " +
           "WHERE t1.ipAddress IS NOT NULL AND t2.ipAddress IS NOT NULL " +
           "AND t1.ipAddress = t2.ipAddress AND t1.id <> t2.id " +
           "MERGE (t1)-[:SAME_IP]-(t2)")
    void createIpConnections();
    
    @Query("MATCH (t1:Transaction), (t2:Transaction) " +
           "WHERE t1.paymentMethod IS NOT NULL AND t2.paymentMethod IS NOT NULL " +
           "AND t1.paymentMethod = t2.paymentMethod AND t1.id <> t2.id " +
           "MERGE (t1)-[:SAME_PAYMENT_METHOD]-(t2)")
    void createPaymentMethodConnections();
    
    @Query("MATCH (u:User)-[:SENT]-(t:Transaction) WHERE u.id = $userId RETURN t ORDER BY t.createdAt DESC")
    List<Transaction> findTransactionsBySender(@Param("userId") Long userId);
    
    @Query("MATCH (u:User)-[:RECEIVED]-(t:Transaction) WHERE u.id = $userId RETURN t ORDER BY t.createdAt DESC")
    List<Transaction> findTransactionsByRecipient(@Param("userId") Long userId);

    @Query("MATCH (u:User), (t:Transaction) " +
           "WHERE u.id = $senderId AND t.id = $transactionId " +
           "MERGE (u)-[:SENT]->(t)")
    void createSentRelationship(@Param("senderId") Long senderId, @Param("transactionId") Long transactionId);
    
    @Query("MATCH (u:User), (t:Transaction) " +
           "WHERE u.id = $recipientId AND t.id = $transactionId " +
           "MERGE (t)-[:RECEIVED]->(u)")
    void createReceivedRelationship(@Param("recipientId") Long recipientId, @Param("transactionId") Long transactionId);

}
