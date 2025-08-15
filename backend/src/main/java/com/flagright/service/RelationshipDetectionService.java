package com.flagright.service;

import com.flagright.Repository.TransactionConnectionRepository;
import com.flagright.Repository.TransactionRepository;
import com.flagright.Repository.UserConnectionRepository;
import com.flagright.Repository.UserRepository;
import com.flagright.model.entity.Transaction;
import com.flagright.model.entity.User;
import com.flagright.model.entity.UserConnection;
import com.flagright.model.entity.TransactionConnection;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RelationshipDetectionService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final UserConnectionRepository userConnectionRepository;
    private final TransactionConnectionRepository transactionConnectionRepository;

    public void detectUserRelationships(User user) {
        log.info("Detecting relationships for user: {}", user.getEmail());
        
        try {
            if (user.getEmail() != null && !user.getEmail().trim().isEmpty()) {
                userRepository.createEmailConnections();
                log.debug("Created email connections for user: {}", user.getEmail());
            }
            
            if (user.getPhone() != null && !user.getPhone().trim().isEmpty()) {
                userRepository.createPhoneConnections();
                log.debug("Created phone connections for user: {}", user.getPhone());
            }

            if (user.getAddress() != null && !user.getAddress().trim().isEmpty()) {
                userRepository.createAddressConnections();
                log.debug("Created address connections for user: {}", user.getAddress());
            }
            
            Long relationshipCount = userRepository.countUserRelationships();
            log.debug("Total graph relationships after Cypher: {}", relationshipCount);
            
        } catch (Exception e) {
            log.warn("Cypher-based relationship detection failed for user {}, using Java-based approach", user.getEmail(), e);
        }
        
        try {
            detectUserRelationshipsJava(user);
        } catch (Exception e) {
            log.error("Java-based relationship detection also failed for user {}", user.getEmail(), e);
        }
    }

    private void detectUserRelationshipsJava(User user) {
        log.debug("Running Java-based relationship detection for user: {}", user.getEmail());
        
        List<User> allUsers = userRepository.findAll();
        
        if (user.getPhone() != null && !user.getPhone().trim().isEmpty()) {
            List<User> usersWithSamePhone = allUsers.stream()
                .filter(u -> u.getPhone() != null && u.getPhone().equals(user.getPhone()) && !u.getId().equals(user.getId()))
                .collect(Collectors.toList());
            
            for (User connectedUser : usersWithSamePhone) {
                createUserConnectionIfNotExists(user.getId(), connectedUser.getId(), "SHARES_PHONE", user.getPhone());
            }
        }
        
        if (user.getAddress() != null && !user.getAddress().trim().isEmpty()) {
            List<User> usersWithSameAddress = allUsers.stream()
                .filter(u -> u.getAddress() != null && u.getAddress().equals(user.getAddress()) && !u.getId().equals(user.getId()))
                .collect(Collectors.toList());
            
            for (User connectedUser : usersWithSameAddress) {
                createUserConnectionIfNotExists(user.getId(), connectedUser.getId(), "SHARES_ADDRESS", user.getAddress());
            }
        }
        
        if (user.getEmail() != null && !user.getEmail().trim().isEmpty()) {
            List<User> usersWithSameEmail = allUsers.stream()
                .filter(u -> u.getEmail() != null && u.getEmail().equals(user.getEmail()) && !u.getId().equals(user.getId()))
                .collect(Collectors.toList());
            
            for (User connectedUser : usersWithSameEmail) {
                createUserConnectionIfNotExists(user.getId(), connectedUser.getId(), "SHARES_EMAIL", user.getEmail());
            }
        }
    }
    
    /**
     * Helper method to create a UserConnection if it doesn't already exist
     */
    private void createUserConnectionIfNotExists(Long userId1, Long userId2, String relationshipType, String sharedValue) {
        if (!userConnectionRepository.existsByUserId1AndUserId2AndRelationshipType(userId1, userId2, relationshipType) &&
            !userConnectionRepository.existsByUserId1AndUserId2AndRelationshipType(userId2, userId1, relationshipType)) {
            
            UserConnection connection = new UserConnection(userId1, userId2, relationshipType, sharedValue);
            userConnectionRepository.save(connection);
            log.debug("Created {} connection between users {} and {} with shared value: {}", 
                relationshipType, userId1, userId2, sharedValue);
        }
    }

    public void detectTransactionRelationships(Transaction transaction) {
        log.info("Detecting relationships for transaction: {}", transaction.getId());
        
        if (transaction.getDeviceId() != null && !transaction.getDeviceId().trim().isEmpty()) {
            transactionRepository.createDeviceConnections();
            log.debug("Created device connections for transaction: {}", transaction.getId());
        }
        
        if (transaction.getIpAddress() != null && !transaction.getIpAddress().trim().isEmpty()) {
            transactionRepository.createIpConnections();
            log.debug("Created IP connections for transaction: {}", transaction.getId());
        }
        
        if (transaction.getPaymentMethod() != null && !transaction.getPaymentMethod().trim().isEmpty()) {
            transactionRepository.createPaymentMethodConnections();
            log.debug("Created payment method connections for transaction: {}", transaction.getId());
        }
        
    }

    public void detectAllRelationships() {
        log.info("Running full relationship detection across all entities");
  
        try {
            userRepository.createEmailConnections();
            userRepository.createPhoneConnections();
            userRepository.createAddressConnections();

            transactionRepository.createDeviceConnections();
            transactionRepository.createIpConnections();
            transactionRepository.createPaymentMethodConnections();
        } catch (Exception e) {
            log.warn("Cypher-based relationship detection failed, using Java-based approach", e);
        }
        
        detectAllRelationshipsJava();
        
        log.info("Completed full relationship detection");
    }

    public void detectAllRelationshipsJava() {
        log.info("Running Java-based relationship detection");
        
        List<User> allUsers = userRepository.findAll();
        log.info("Processing {} users for relationship detection", allUsers.size());
        
        Map<String, List<User>> phoneGroups = allUsers.stream()
            .filter(u -> u.getPhone() != null && !u.getPhone().trim().isEmpty())
            .collect(Collectors.groupingBy(User::getPhone));
        
        Map<String, List<User>> addressGroups = allUsers.stream()
            .filter(u -> u.getAddress() != null && !u.getAddress().trim().isEmpty())
            .collect(Collectors.groupingBy(User::getAddress));
        
        createUserPhoneRelationships(phoneGroups);
        
        createUserAddressRelationships(addressGroups);
        
        List<Transaction> allTransactions = transactionRepository.findAll();
        log.info("Processing {} transactions for relationship detection", allTransactions.size());
        
        Map<String, List<Transaction>> deviceGroups = allTransactions.stream()
            .filter(t -> t.getDeviceId() != null && !t.getDeviceId().trim().isEmpty())
            .collect(Collectors.groupingBy(Transaction::getDeviceId));
        
        Map<String, List<Transaction>> ipGroups = allTransactions.stream()
            .filter(t -> t.getIpAddress() != null && !t.getIpAddress().trim().isEmpty())
            .collect(Collectors.groupingBy(Transaction::getIpAddress));
        
        Map<String, List<Transaction>> paymentGroups = allTransactions.stream()
            .filter(t -> t.getPaymentMethod() != null && !t.getPaymentMethod().trim().isEmpty())
            .collect(Collectors.groupingBy(Transaction::getPaymentMethod));
        
        createTransactionDeviceRelationships(deviceGroups);
        createTransactionIpRelationships(ipGroups);
        createTransactionPaymentRelationships(paymentGroups);
        
        log.info("Java-based relationship detection completed");
    }

    private void createUserPhoneRelationships(Map<String, List<User>> phoneGroups) {
        int relationshipsCreated = 0;
        for (Map.Entry<String, List<User>> entry : phoneGroups.entrySet()) {
            List<User> usersWithSharedPhone = entry.getValue();
            if (usersWithSharedPhone.size() > 1) {
                String sharedPhone = entry.getKey();
                log.debug("Found {} users sharing phone: {}", usersWithSharedPhone.size(), sharedPhone);
                
                for (int i = 0; i < usersWithSharedPhone.size(); i++) {
                    for (int j = i + 1; j < usersWithSharedPhone.size(); j++) {
                        User user1 = usersWithSharedPhone.get(i);
                        User user2 = usersWithSharedPhone.get(j);
                        
                        if (!userConnectionRepository.existsByUserId1AndUserId2AndRelationshipType(
                                user1.getId(), user2.getId(), "SHARES_PHONE") &&
                            !userConnectionRepository.existsByUserId1AndUserId2AndRelationshipType(
                                user2.getId(), user1.getId(), "SHARES_PHONE")) {
                            
                            UserConnection connection = new UserConnection(
                                user1.getId(), user2.getId(), "SHARES_PHONE", sharedPhone
                            );
                            userConnectionRepository.save(connection);
                            relationshipsCreated++;
                        }
                    }
                }
            }
        }
        log.info("Created {} phone relationships", relationshipsCreated);
    }

    private void createUserAddressRelationships(Map<String, List<User>> addressGroups) {
        int relationshipsCreated = 0;
        for (Map.Entry<String, List<User>> entry : addressGroups.entrySet()) {
            List<User> usersWithSharedAddress = entry.getValue();
            if (usersWithSharedAddress.size() > 1) {
                String sharedAddress = entry.getKey();
                log.debug("Found {} users sharing address: {}", usersWithSharedAddress.size(), sharedAddress);
                
                for (int i = 0; i < usersWithSharedAddress.size(); i++) {
                    for (int j = i + 1; j < usersWithSharedAddress.size(); j++) {
                        User user1 = usersWithSharedAddress.get(i);
                        User user2 = usersWithSharedAddress.get(j);
                        
                        if (!userConnectionRepository.existsByUserId1AndUserId2AndRelationshipType(
                                user1.getId(), user2.getId(), "SHARES_ADDRESS") &&
                            !userConnectionRepository.existsByUserId1AndUserId2AndRelationshipType(
                                user2.getId(), user1.getId(), "SHARES_ADDRESS")) {
                            
                            UserConnection connection = new UserConnection(
                                user1.getId(), user2.getId(), "SHARES_ADDRESS", sharedAddress
                            );
                            userConnectionRepository.save(connection);
                            relationshipsCreated++;
                        }
                    }
                }
            }
        }
        log.info("Created {} address relationships", relationshipsCreated);
    }

    private void createTransactionDeviceRelationships(Map<String, List<Transaction>> deviceGroups) {
        int relationshipsCreated = 0;
        for (Map.Entry<String, List<Transaction>> entry : deviceGroups.entrySet()) {
            List<Transaction> txs = entry.getValue();
            if (txs.size() > 1) {
                String sharedDevice = entry.getKey();
                for (int i = 0; i < txs.size(); i++) {
                    for (int j = i + 1; j < txs.size(); j++) {
                        Transaction tx1 = txs.get(i);
                        Transaction tx2 = txs.get(j);
                        if (!transactionConnectionRepository.existsByTransactionId1AndTransactionId2AndRelationshipType(
                                tx1.getId(), tx2.getId(), "SAME_DEVICE")) {
                            transactionConnectionRepository.save(new TransactionConnection(
                                tx1.getId(), tx2.getId(), "SAME_DEVICE", sharedDevice));
                            relationshipsCreated++;
                        }
                    }
                }
            }
        }
        log.info("Created {} device relationships", relationshipsCreated);
    }

    private void createTransactionIpRelationships(Map<String, List<Transaction>> ipGroups) {
        int relationshipsCreated = 0;
        for (Map.Entry<String, List<Transaction>> entry : ipGroups.entrySet()) {
            List<Transaction> txs = entry.getValue();
            if (txs.size() > 1) {
                String sharedIp = entry.getKey();
                for (int i = 0; i < txs.size(); i++) {
                    for (int j = i + 1; j < txs.size(); j++) {
                        Transaction tx1 = txs.get(i);
                        Transaction tx2 = txs.get(j);
                        if (!transactionConnectionRepository.existsByTransactionId1AndTransactionId2AndRelationshipType(
                                tx1.getId(), tx2.getId(), "SAME_IP")) {
                            transactionConnectionRepository.save(new TransactionConnection(
                                tx1.getId(), tx2.getId(), "SAME_IP", sharedIp));
                            relationshipsCreated++;
                        }
                    }
                }
            }
        }
        log.info("Created {} IP relationships", relationshipsCreated);
    }

    private void createTransactionPaymentRelationships(Map<String, List<Transaction>> paymentGroups) {
        int relationshipsCreated = 0;
        for (Map.Entry<String, List<Transaction>> entry : paymentGroups.entrySet()) {
            List<Transaction> txs = entry.getValue();
            if (txs.size() > 1) {
                String sharedPayment = entry.getKey();
                for (int i = 0; i < txs.size(); i++) {
                    for (int j = i + 1; j < txs.size(); j++) {
                        Transaction tx1 = txs.get(i);
                        Transaction tx2 = txs.get(j);
                        if (!transactionConnectionRepository.existsByTransactionId1AndTransactionId2AndRelationshipType(
                                tx1.getId(), tx2.getId(), "SAME_PAYMENT_METHOD")) {
                            transactionConnectionRepository.save(new TransactionConnection(
                                tx1.getId(), tx2.getId(), "SAME_PAYMENT_METHOD", sharedPayment));
                            relationshipsCreated++;
                        }
                    }
                }
            }
        }
        log.info("Created {} payment method relationships", relationshipsCreated);
    }
}