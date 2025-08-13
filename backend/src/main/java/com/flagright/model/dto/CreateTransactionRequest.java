package com.flagright.model.dto;

import lombok.Data;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
public class CreateTransactionRequest {
    
    @NotNull(message = "Sender ID is required")
    private Long senderId;
    
    @NotNull(message = "Recipient ID is required")
    private Long recipientId;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;
    
    @NotBlank(message = "Currency is required")
    private String currency;
    
    private String description;
    private String ipAddress;
    private String deviceId;
    
    @NotBlank(message = "Payment method is required")
    private String paymentMethod;
} 