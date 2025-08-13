package com.flagright.Repository;

import com.flagright.model.entity.User;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends Neo4jRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);
    
    List<User> findByFirstNameContainingIgnoreCase(String firstName);

    @Query("MATCH (u:User)-[r]-(connected:User) WHERE u.id = $userId RETURN connected")
    List<User> findUserConnections(@Param("userId") Long userId);

    @Query("MATCH ()-[r:SHARES_EMAIL|SHARES_PHONE|SHARES_ADDRESS]-() RETURN count(r)")
    Long countUserRelationships();

    @Query("MATCH (u1:User), (u2:User) " +
           "WHERE u1.email IS NOT NULL AND u2.email IS NOT NULL " +
           "AND u1.email = u2.email AND u1.id <> u2.id " +
           "MERGE (u1)-[:SHARES_EMAIL]-(u2)")
    void createEmailConnections();
    
    @Query("MATCH (u1:User), (u2:User) " +
           "WHERE u1.phone IS NOT NULL AND u2.phone IS NOT NULL " +
           "AND u1.phone = u2.phone AND u1.id <> u2.id " +
           "MERGE (u1)-[:SHARES_PHONE]-(u2)")
    void createPhoneConnections();
    
    @Query("MATCH (u1:User), (u2:User) " +
           "WHERE u1.address IS NOT NULL AND u2.address IS NOT NULL " +
           "AND u1.address = u2.address AND u1.id <> u2.id " +
           "MERGE (u1)-[:SHARES_ADDRESS]-(u2)")
    void createAddressConnections();
    
    @Query("MATCH (u:User) WHERE u.email = $email OR u.phone = $phone RETURN u")
    List<User> findByEmailOrPhone(@Param("email") String email, @Param("phone") String phone);
}
