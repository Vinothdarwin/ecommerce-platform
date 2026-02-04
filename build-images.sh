#!/bin/bash

# Build all Docker images for the e-commerce microservices

set -e

echo "Building Docker images..."

# Build Auth Service
echo "Building auth-service..."
docker build -t ecommerce/auth-service:latest ./auth-service

# Build Product Service
echo "Building product-service..."
docker build -t ecommerce/product-service:latest ./product-service

# Build Cart Service
echo "Building cart-service..."
docker build -t ecommerce/cart-service:latest ./cart-service

# Build Frontend
echo "Building frontend..."
docker build -t ecommerce/frontend:latest ./frontend

echo "All images built successfully!"
echo ""
echo "Images:"
echo "- ecommerce/auth-service:latest"
echo "- ecommerce/product-service:latest"
echo "- ecommerce/cart-service:latest"
echo "- ecommerce/frontend:latest"
