#!/bin/bash

# Clean up all e-commerce microservices from Kubernetes

set -e

echo "Cleaning up E-Commerce Microservices from Kubernetes..."
echo ""

read -p "Are you sure you want to delete all resources? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cleanup cancelled."
    exit 0
fi

echo "Deleting all resources in ecommerce namespace..."

# Delete deployments and services
kubectl delete -f k8s/frontend/ --ignore-not-found=true
kubectl delete -f k8s/gateway/ --ignore-not-found=true
kubectl delete -f k8s/cart/ --ignore-not-found=true
kubectl delete -f k8s/product/ --ignore-not-found=true
kubectl delete -f k8s/auth/ --ignore-not-found=true
kubectl delete -f k8s/redis/ --ignore-not-found=true
kubectl delete -f k8s/mongodb/ --ignore-not-found=true
kubectl delete -f k8s/config/ --ignore-not-found=true

# Delete namespace (this will delete everything in it)
kubectl delete namespace ecommerce --ignore-not-found=true

echo ""
echo "Cleanup complete!"
echo ""
echo "Note: PersistentVolumes may need to be manually deleted if they were provisioned."
