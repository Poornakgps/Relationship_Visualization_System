package com.flagright.Repository;

import com.flagright.model.entity.UserConnection;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserConnectionRepository extends Neo4jRepository<UserConnection, Long> {
    
    /**
     * Finds all user connections where the specified user ID appears as either userId1 or userId2
     * @param userId1 The first user ID to search for
     * @param userId2 The second user ID to search for (typically same as userId1)
     * @return List of UserConnection entities involving the specified user
     */
    List<UserConnection> findByUserId1OrUserId2(Long userId1, Long userId2);
    
    /**
     * Finds all user connections of a specific relationship type
     * @param relationshipType The type of relationship (e.g., SHARES_EMAIL, SHARES_PHONE, SHARES_ADDRESS)
     * @return List of UserConnection entities with the specified relationship type
     */
    List<UserConnection> findByRelationshipType(String relationshipType);
    
    /**
     * Checks if a user connection already exists between two users with a specific relationship type
     * @param userId1 The ID of the first user
     * @param userId2 The ID of the second user
     * @param relationshipType The type of relationship to check for
     * @return True if the connection exists, false otherwise
     */
    boolean existsByUserId1AndUserId2AndRelationshipType(Long userId1, Long userId2, String relationshipType);
} 