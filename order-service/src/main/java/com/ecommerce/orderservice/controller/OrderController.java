package com.ecommerce.orderservice.controller;

import com.ecommerce.orderservice.model.Order;
import com.ecommerce.orderservice.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "order-service");
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Order order) {
        try {
            Order createdOrder = orderService.createOrder(order);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Order created successfully");
            response.put("order", createdOrder);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Error creating order");
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable String id) {
        Optional<Order> order = orderService.getOrderById(id);
        if (order.isPresent()) {
            return ResponseEntity.ok(order.get());
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Order not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getOrderByOrderId(@PathVariable String orderId) {
        Optional<Order> order = orderService.getOrderByOrderId(orderId);
        if (order.isPresent()) {
            return ResponseEntity.ok(order.get());
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Order not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUserId(@PathVariable String userId) {
        List<Order> orders = orderService.getOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Order>> getOrdersByStatus(@PathVariable Order.OrderStatus status) {
        List<Order> orders = orderService.getOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }
    
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable String orderId,
            @RequestBody Map<String, String> request) {
        try {
            Order.OrderStatus status = Order.OrderStatus.valueOf(request.get("status"));
            Order updatedOrder = orderService.updateOrderStatus(orderId, status);
            
            if (updatedOrder != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Order status updated");
                response.put("order", updatedOrder);
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Order not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error updating order status");
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @PatchMapping("/{orderId}/payment-status")
    public ResponseEntity<?> updatePaymentStatus(
            @PathVariable String orderId,
            @RequestBody Map<String, String> request) {
        try {
            Order.PaymentStatus paymentStatus = Order.PaymentStatus.valueOf(request.get("paymentStatus"));
            String transactionId = request.get("transactionId");
            
            Order updatedOrder = orderService.updatePaymentStatus(orderId, paymentStatus, transactionId);
            
            if (updatedOrder != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Payment status updated");
                response.put("order", updatedOrder);
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Order not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error updating payment status");
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @DeleteMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable String orderId) {
        try {
            Order cancelledOrder = orderService.cancelOrder(orderId);
            
            if (cancelledOrder != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Order cancelled successfully");
                response.put("order", cancelledOrder);
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Order not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteOrder(@PathVariable String id) {
        try {
            orderService.deleteOrder(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Order deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error deleting order");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
