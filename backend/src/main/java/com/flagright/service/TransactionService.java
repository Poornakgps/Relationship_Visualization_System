package com.flagright.service;

import com.flagright.model.entity.Transaction;
import com.flagright.model.entity.TransactionConnection;
import com.flagright.model.entity.User;
import com.flagright.model.dto.CreateTransactionRequest;
import com.flagright.model.dto.TransactionConnectionDto;
import com.flagright.Repository.TransactionConnectionRepository;
import com.flagright.Repository.TransactionRepository;
import com.flagright.Repository.UserRepository;
import com.flagright.exception.TransactionNotFoundException;
import com.flagright.exception.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TransactionService {
    
    private final TransactionRepository transactionRepository;
    private final TransactionConnectionRepository transactionConnectionRepository;
    private final UserService userService;
    private final RelationshipDetectionService relationshipDetectionService;

    /** Creates a new transaction between two users */
    public Transaction createTransaction(Transaction transaction, Long senderId, Long recipientId) {
        log.info("Creating transaction from user {} to user {} for amount {}", 
                senderId, recipientId, transaction.getAmount());

        User sender = userService.getUserById(senderId);
        User recipient = userService.getUserById(recipientId);

        validateTransaction(transaction);

        transaction.setSender(sender);
        transaction.setRecipient(recipient);
        transaction.setStatus("PENDING");
        transaction.setCreatedAt(LocalDateTime.now());

        Transaction savedTransaction = transactionRepository.save(transaction);

        transactionRepository.createSentRelationship(senderId, savedTransaction.getId());
        transactionRepository.createReceivedRelationship(recipientId, savedTransaction.getId());

        relationshipDetectionService.detectTransactionRelationships(savedTransaction);

        log.info("Transaction created with ID: {}", savedTransaction.getId());
        return savedTransaction;
    }

    /** Updates transaction status */
    public Transaction updateTransactionStatus(Long transactionId, String status) {
        log.info("Updating transaction {} status to {}", transactionId, status);
        
        Transaction transaction = getTransactionById(transactionId);
        transaction.setStatus(status);
        
        if ("COMPLETED".equals(status)) {
            transaction.setCompletedAt(LocalDateTime.now());
        }
        
        return transactionRepository.save(transaction);
    }

    /** Gets transaction by ID */
    @Transactional(readOnly = true)
    public Transaction getTransactionById(Long transactionId) {
        return transactionRepository.findById(transactionId)
                .orElseThrow(() -> new TransactionNotFoundException("Transaction not found with ID: " + transactionId));
    }

    /** Gets all transactions */
    @Transactional(readOnly = true)
    public List<Transaction> getAllTransactions() {
        log.info("Fetching all transactions");
        return transactionRepository.findAll();
    }

    /** Gets transactions sent or received by a user */
    @Transactional(readOnly = true)
    public List<Transaction> getTransactionsByUser(Long userId, String type) {
        log.info("Fetching {} transactions for user {}", type, userId);
        
        if ("sent".equalsIgnoreCase(type)) {
            return transactionRepository.findTransactionsBySender(userId);
        } else if ("received".equalsIgnoreCase(type)) {
            return transactionRepository.findTransactionsByRecipient(userId);
        } else {
            throw new IllegalArgumentException("Invalid transaction type. Use 'sent' or 'received'");
        }
    }

    /** Gets connected transactions */
    @Transactional(readOnly = true)
    public List<Transaction> getTransactionConnections(Long transactionId) {
        log.info("Fetching connections for transaction ID: {}", transactionId);
        
        getTransactionById(transactionId);
        
        List<TransactionConnection> connections = transactionConnectionRepository
            .findByTransactionId1OrTransactionId2(transactionId, transactionId);
        
        List<Long> connectedTransactionIds = connections.stream()
            .map(conn -> conn.getTransactionId1().equals(transactionId) ? 
                conn.getTransactionId2() : conn.getTransactionId1())
            .distinct()
            .collect(Collectors.toList());
        
        return transactionRepository.findAllById(connectedTransactionIds);
    }

    /** Gets transaction connections with relationship details */
    @Transactional(readOnly = true)
    public List<TransactionConnectionDto> getTransactionConnectionsGrouped(Long transactionId) {
        log.info("Fetching grouped connections for transaction ID: {}", transactionId);
        getTransactionById(transactionId);
        
        List<TransactionConnection> connections = transactionConnectionRepository
            .findByTransactionId1OrTransactionId2(transactionId, transactionId);
        
        Map<Long, TransactionConnectionDto> groupedConnections = new HashMap<>();
        
        for (TransactionConnection conn : connections) {
            Long connectedTransactionId = conn.getTransactionId1().equals(transactionId) ? 
                conn.getTransactionId2() : conn.getTransactionId1();
            Transaction connectedTransaction = transactionRepository.findById(connectedTransactionId).orElse(null);
            
            if (connectedTransaction != null) {
                TransactionConnectionDto dto = groupedConnections.get(connectedTransactionId);
                
                if (dto == null) {
                    dto = new TransactionConnectionDto(
                        connectedTransaction, 
                        conn.getRelationshipType(), 
                        conn.getSharedValue(),
                        conn.getCreatedAt()
                    );
                    groupedConnections.put(connectedTransactionId, dto);
                } else {
                    dto.addRelationship(
                        conn.getRelationshipType(), 
                        conn.getSharedValue(),
                        conn.getCreatedAt()
                    );
                }
            }
        }
        
        return new ArrayList<>(groupedConnections.values());
    }

    /** Gets transactions by status */
    @Transactional(readOnly = true)
    public List<Transaction> getTransactionsByStatus(String status) {
        log.info("Fetching transactions with status: {}", status);
        return transactionRepository.findByStatus(status);
    }

    /** Gets high value transactions above threshold */
    @Transactional(readOnly = true)
    public List<Transaction> getHighValueTransactions(BigDecimal threshold) {
        log.info("Fetching transactions above amount: {}", threshold);
        return transactionRepository.findByAmountGreaterThan(threshold);
    }

    /** Gets transactions within date range */
    @Transactional(readOnly = true)
    public List<Transaction> getTransactionsByDateRange(LocalDateTime start, LocalDateTime end) {
        log.info("Fetching transactions between {} and {}", start, end);
        return transactionRepository.findByCreatedAtBetween(start, end);
    }

    /** Validates transaction data */
    private void validateTransaction(Transaction transaction) {
        if (transaction.getAmount() == null || transaction.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Transaction amount must be positive");
        }
        
        if (transaction.getCurrency() == null || transaction.getCurrency().trim().isEmpty()) {
            throw new IllegalArgumentException("Currency is required");
        }
        
        if (transaction.getAmount().compareTo(new BigDecimal("1000000")) > 0) {
            log.warn("High-value transaction detected: {}", transaction.getAmount());
        }
    }
}
