package com.ecommerce.orderservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
public class Order {
    
    @Id
    private String id;
    
    private String orderId;
    private String userId;
    private List<OrderItem> items;
    private Double totalAmount;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private String transactionId;
    
    private ShippingAddress shippingAddress;
    private String shippingMethod;
    private Double shippingCost;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deliveredAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItem {
        private String productId;
        private String productName;
        private Integer quantity;
        private Double price;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShippingAddress {
        private String street;
        private String city;
        private String state;
        private String zipCode;
        private String country;
        private String phone;
    }
    
    public enum OrderStatus {
        PENDING,
        CONFIRMED,
        PROCESSING,
        SHIPPED,
        DELIVERED,
        CANCELLED
    }
    
    public enum PaymentStatus {
        PENDING,
        PAID,
        FAILED,
        REFUNDED
    }
}
