package com.flagright.service;

import com.flagright.model.entity.Transaction;
import com.flagright.model.entity.TransactionConnection;
import com.flagright.model.entity.User;
import com.flagright.model.dto.TransactionConnectionDto;
import com.flagright.Repository.TransactionRepository;
import com.flagright.Repository.TransactionConnectionRepository;
import com.flagright.exception.TransactionNotFoundException;
import lombok.RequiredArgsConstructor;
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
@Transactional
public class TransactionService {
    
    private final TransactionRepository transactionRepository;
    private final TransactionConnectionRepository transactionConnectionRepository;
    private final UserService userService;
    private final RelationshipDetectionService relationshipDetectionService;

    public Transaction createTransaction(Transaction transaction, Long senderId, Long recipientId) {
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

        return savedTransaction;
    }

    public Transaction updateTransactionStatus(Long transactionId, String status) {
        Transaction transaction = getTransactionById(transactionId);
        transaction.setStatus(status);
        
        if ("COMPLETED".equals(status)) {
            transaction.setCompletedAt(LocalDateTime.now());
        }
        
        return transactionRepository.save(transaction);
    }

    @Transactional(readOnly = true)
    public Transaction getTransactionById(Long transactionId) {
        return transactionRepository.findById(transactionId)
                .orElseThrow(() -> new TransactionNotFoundException("Transaction not found with ID: " + transactionId));
    }

    @Transactional(readOnly = true)
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Transaction> getTransactionsByUser(Long userId, String type) {
        if ("sent".equalsIgnoreCase(type)) {
            return transactionRepository.findTransactionsBySender(userId);
        } else if ("received".equalsIgnoreCase(type)) {
            return transactionRepository.findTransactionsByRecipient(userId);
        } else {
            throw new IllegalArgumentException("Invalid transaction type. Use 'sent' or 'received'");
        }
    }

    @Transactional(readOnly = true)
    public List<Transaction> getTransactionConnections(Long transactionId) {
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

    @Transactional(readOnly = true)
    public List<TransactionConnectionDto> getTransactionConnectionsGrouped(Long transactionId) {
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

    @Transactional(readOnly = true)
    public List<Transaction> getTransactionsByStatus(String status) {
        return transactionRepository.findByStatus(status);
    }

    @Transactional(readOnly = true)
    public List<Transaction> getHighValueTransactions(BigDecimal threshold) {
        return transactionRepository.findByAmountGreaterThan(threshold);
    }

    @Transactional(readOnly = true)
    public List<Transaction> getTransactionsByDateRange(LocalDateTime start, LocalDateTime end) {
        return transactionRepository.findByCreatedAtBetween(start, end);
    }

    private void validateTransaction(Transaction transaction) {
        if (transaction.getAmount() == null || transaction.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Transaction amount must be positive");
        }
        
        if (transaction.getCurrency() == null || transaction.getCurrency().trim().isEmpty()) {
            throw new IllegalArgumentException("Currency is required");
        }
    }
}
