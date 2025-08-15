package com.flagright.Repository;

import com.flagright.model.entity.UserConnection;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserConnectionRepository extends Neo4jRepository<UserConnection, Long> {
    

    List<UserConnection> findByUserId1OrUserId2(Long userId1, Long userId2);
    

    List<UserConnection> findByRelationshipType(String relationshipType);
    

    boolean existsByUserId1AndUserId2AndRelationshipType(Long userId1, Long userId2, String relationshipType);
} 