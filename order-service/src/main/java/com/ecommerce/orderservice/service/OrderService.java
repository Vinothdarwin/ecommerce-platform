package com.ecommerce.orderservice.service;

import com.ecommerce.orderservice.model.Order;
import com.ecommerce.orderservice.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    public Order createOrder(Order order) {
        order.setOrderId("ORD-" + System.currentTimeMillis());
        order.setStatus(Order.OrderStatus.PENDING);
        order.setPaymentStatus(Order.PaymentStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        
        return orderRepository.save(order);
    }
    
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    
    public Optional<Order> getOrderById(String id) {
        return orderRepository.findById(id);
    }
    
    public Optional<Order> getOrderByOrderId(String orderId) {
        return orderRepository.findByOrderId(orderId);
    }
    
    public List<Order> getOrdersByUserId(String userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public List<Order> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status);
    }
    
    public Order updateOrderStatus(String orderId, Order.OrderStatus status) {
        Optional<Order> orderOpt = orderRepository.findByOrderId(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setStatus(status);
            order.setUpdatedAt(LocalDateTime.now());
            
            if (status == Order.OrderStatus.DELIVERED) {
                order.setDeliveredAt(LocalDateTime.now());
            }
            
            return orderRepository.save(order);
        }
        return null;
    }
    
    public Order updatePaymentStatus(String orderId, Order.PaymentStatus paymentStatus, String transactionId) {
        Optional<Order> orderOpt = orderRepository.findByOrderId(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setPaymentStatus(paymentStatus);
            order.setTransactionId(transactionId);
            order.setUpdatedAt(LocalDateTime.now());
            
            if (paymentStatus == Order.PaymentStatus.PAID) {
                order.setStatus(Order.OrderStatus.CONFIRMED);
            }
            
            return orderRepository.save(order);
        }
        return null;
    }
    
    public Order cancelOrder(String orderId) {
        Optional<Order> orderOpt = orderRepository.findByOrderId(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            
            if (order.getStatus() == Order.OrderStatus.DELIVERED) {
                throw new IllegalStateException("Cannot cancel delivered order");
            }
            
            order.setStatus(Order.OrderStatus.CANCELLED);
            order.setUpdatedAt(LocalDateTime.now());
            
            return orderRepository.save(order);
        }
        return null;
    }
    
    public void deleteOrder(String id) {
        orderRepository.deleteById(id);
    }
}
