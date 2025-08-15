package com.flagright.Repository;

import com.flagright.model.entity.TransactionConnection;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionConnectionRepository extends Neo4jRepository<TransactionConnection, Long> {
    

    List<TransactionConnection> findByTransactionId1OrTransactionId2(Long transactionId1, Long transactionId2);
    

    List<TransactionConnection> findByRelationshipType(String relationshipType);
    

    boolean existsByTransactionId1AndTransactionId2AndRelationshipType(Long transactionId1, Long transactionId2, String relationshipType);
    
 
    void deleteByTransactionId1OrTransactionId2(Long transactionId1, Long transactionId2);
} 