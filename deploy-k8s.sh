#!/bin/bash

# Deploy e-commerce microservices to Kubernetes

set -e

echo "Deploying E-Commerce Microservices to Kubernetes..."
echo ""

# Create namespace
echo "1. Creating namespace..."
kubectl apply -f k8s/namespace.yaml

# Create ConfigMap and Secrets
echo "2. Creating ConfigMap and Secrets..."
kubectl apply -f k8s/config/

# Deploy databases
echo "3. Deploying MongoDB..."
kubectl apply -f k8s/mongodb/

echo "4. Deploying Redis..."
kubectl apply -f k8s/redis/

echo "5. Waiting for databases to be ready..."
sleep 10

# Deploy microservices
echo "6. Deploying Auth Service..."
kubectl apply -f k8s/auth/

echo "7. Deploying Product Service..."
kubectl apply -f k8s/product/

echo "8. Deploying Cart Service..."
kubectl apply -f k8s/cart/

# Deploy API Gateway
echo "9. Deploying API Gateway (Kong)..."
kubectl apply -f k8s/gateway/

# Deploy Frontend
echo "10. Deploying Frontend..."
kubectl apply -f k8s/frontend/

echo ""
echo "Deployment complete!"
echo ""
echo "Checking deployment status..."
kubectl get pods -n ecommerce
echo ""
echo "Services:"
kubectl get services -n ecommerce
echo ""
echo "To access the application:"
echo "1. Get the Frontend LoadBalancer IP:"
echo "   kubectl get service frontend -n ecommerce"
echo ""
echo "2. Get the API Gateway LoadBalancer IP:"
echo "   kubectl get service api-gateway -n ecommerce"
echo ""
echo "3. Access the frontend at: http://<FRONTEND_IP>"
