package com.flagright;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.neo4j.repository.config.EnableNeo4jRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;


@SpringBootApplication
@EnableNeo4jRepositories
@EnableTransactionManagement
public class FlagrightApplication {
    
    public static void main(String[] args){
        SpringApplication.run(FlagrightApplication.class, args);
    }
}
