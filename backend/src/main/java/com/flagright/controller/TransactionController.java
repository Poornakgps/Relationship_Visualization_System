
package com.flagright.controller;

import com.flagright.model.entity.Transaction;
import com.flagright.model.dto.CreateTransactionRequest;
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

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@Valid @RequestBody CreateTransactionRequest request) {

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

    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        List<Transaction> transactions = transactionService.getAllTransactions();
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable Long id) {
        Transaction transaction = transactionService.getTransactionById(id);
        return ResponseEntity.ok(transaction);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Transaction> updateTransactionStatus(@PathVariable Long id, @RequestParam String status) {
        Transaction updatedTransaction = transactionService.updateTransactionStatus(id, status);
        return ResponseEntity.ok(updatedTransaction);
    }

    @GetMapping("/{id}/connections")
    public ResponseEntity<List<Transaction>> getTransactionConnections(@PathVariable Long id) {
        List<Transaction> connections = transactionService.getTransactionConnections(id);
        return ResponseEntity.ok(connections);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Transaction>> getTransactionsByUser(@PathVariable Long userId, @RequestParam String type) {
        List<Transaction> transactions = transactionService.getTransactionsByUser(userId, type);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Transaction>> getTransactionsByStatus(@PathVariable String status) {
        List<Transaction> transactions = transactionService.getTransactionsByStatus(status);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/high-value")
    public ResponseEntity<List<Transaction>> getHighValueTransactions(@RequestParam BigDecimal threshold) {
        List<Transaction> transactions = transactionService.getHighValueTransactions(threshold);
        return ResponseEntity.ok(transactions);
    }

} 