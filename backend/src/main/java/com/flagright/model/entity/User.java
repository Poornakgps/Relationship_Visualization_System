package com.flagright.model.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.Relationship;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Node("User")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class User {
    
    @Id
    @GeneratedValue
    @EqualsAndHashCode.Include
    private Long Id;

    @Property("email")
    private String email;

    @Property("phone")
    private String phone;

    @Property("firstName")
    private String firstName;

    @Property("lastName")
    private String lastName;

    @Property("address")
    private String address;

    @Property("dateOfBirth")
    private String dateOfBirth;

    @Property("createdAt")
    private LocalDateTime createdAt;

    @Property("updatedAt")
    private LocalDateTime updatedAt;

    @JsonIgnore
    @Relationship(type = "SHARES_EMAIL")
    private Set<User> emailConnections = new HashSet<>();
    
    @JsonIgnore
    @Relationship(type = "SHARES_PHONE")
    private Set<User> phoneConnections = new HashSet<>();
    
    @JsonIgnore
    @Relationship(type = "SHARES_ADDRESS")
    private Set<User> addressConnections = new HashSet<>();
}
