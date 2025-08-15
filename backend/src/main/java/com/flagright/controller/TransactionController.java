
package com.flagright.controller;

import com.flagright.model.entity.Transaction;
import com.flagright.model.dto.CreateTransactionRequest;
import com.flagright.model.dto.TransactionConnectionDto;
import com.flagright.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Slf4j
public class TransactionController {

    private final TransactionService transactionService;

    /** Creates a new transaction */
    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@Valid @RequestBody CreateTransactionRequest request) {
        log.info("Creating transaction from user {} to user {}", request.getSenderId(), request.getRecipientId());
        
        Transaction transaction = new Transaction();
        transaction.setAmount(request.getAmount());
        transaction.setCurrency(request.getCurrency());
        transaction.setDescription(request.getDescription());
        transaction.setIpAddress(request.getIpAddress());
        transaction.setDeviceId(request.getDeviceId());
        transaction.setPaymentMethod(request.getPaymentMethod());
        
        Transaction createdTransaction = transactionService.createTransaction(
            transaction, request.getSenderId(), request.getRecipientId()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTransaction);
    }

    /** Gets all transactions */
    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        log.info("Fetching all transactions");
        List<Transaction> transactions = transactionService.getAllTransactions();
        return ResponseEntity.ok(transactions);
    }

    /** Gets transaction by ID */
    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable Long id) {
        log.info("Fetching transaction with ID: {}", id);
        Transaction transaction = transactionService.getTransactionById(id);
        return ResponseEntity.ok(transaction);
    }

    /** Updates transaction status */
    @PutMapping("/{id}/status")
    public ResponseEntity<Transaction> updateTransactionStatus(@PathVariable Long id, @RequestParam String status) {
        log.info("Updating transaction {} status to {}", id, status);
        Transaction updatedTransaction = transactionService.updateTransactionStatus(id, status);
        return ResponseEntity.ok(updatedTransaction);
    }

    /** Gets transaction connections */
    @GetMapping("/{id}/connections")
    public ResponseEntity<List<TransactionConnectionDto>> getTransactionConnections(@PathVariable Long id) {
        log.info("Fetching connections for transaction ID: {}", id);
        List<TransactionConnectionDto> connections = transactionService.getTransactionConnectionsGrouped(id);
        return ResponseEntity.ok(connections);
    }

    /** Gets user transactions by type */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Transaction>> getTransactionsByUser(@PathVariable Long userId, @RequestParam String type) {
        log.info("Fetching {} transactions for user {}", type, userId);
        List<Transaction> transactions = transactionService.getTransactionsByUser(userId, type);
        return ResponseEntity.ok(transactions);
    }

    /** Gets transactions by status */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Transaction>> getTransactionsByStatus(@PathVariable String status) {
        log.info("Fetching transactions with status: {}", status);
        List<Transaction> transactions = transactionService.getTransactionsByStatus(status);
        return ResponseEntity.ok(transactions);
    }

    /** Gets high value transactions */
    @GetMapping("/high-value")
    public ResponseEntity<List<Transaction>> getHighValueTransactions(@RequestParam BigDecimal threshold) {
        log.info("Fetching transactions above amount: {}", threshold);
        List<Transaction> transactions = transactionService.getHighValueTransactions(threshold);
        return ResponseEntity.ok(transactions);
    }
} 