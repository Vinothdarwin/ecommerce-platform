# Quick Start Guide

This guide will help you get the e-commerce platform running in minutes.

## Prerequisites

- Docker and Docker Compose installed
- OR Kubernetes cluster with kubectl configured

## Option 1: Docker Compose (Recommended for Testing)

1. **Navigate to the project directory:**
   ```bash
   cd ecommerce-microservices
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Wait for services to start (about 30 seconds):**
   ```bash
   docker-compose ps
   ```

4. **Access the application:**
   - Open browser: http://localhost
   - API Gateway: http://localhost:8000

5. **Create your first user:**
   - Click "Register" in the UI
   - Fill in your details
   - Login with your credentials

6. **Add sample products** (optional - requires admin access):
   ```bash
   # Connect to MongoDB
   docker exec -it ecommerce-mongo mongosh ecommerce-products
   
   # Insert sample products
   db.products.insertMany([
     {
       name: "Wireless Mouse",
       description: "Ergonomic wireless mouse with USB receiver",
       price: 29.99,
       category: "Electronics",
       imageUrl: "https://via.placeholder.com/300",
       stock: 50,
       sku: "MOU-001",
       createdAt: new Date(),
       updatedAt: new Date()
     },
     {
       name: "Mechanical Keyboard",
       description: "RGB mechanical gaming keyboard",
       price: 89.99,
       category: "Electronics",
       imageUrl: "https://via.placeholder.com/300",
       stock: 30,
       sku: "KEY-001",
       createdAt: new Date(),
       updatedAt: new Date()
     },
     {
       name: "Cotton T-Shirt",
       description: "Premium quality cotton t-shirt",
       price: 24.99,
       category: "Clothing",
       imageUrl: "https://via.placeholder.com/300",
       stock: 100,
       sku: "TSH-001",
       createdAt: new Date(),
       updatedAt: new Date()
     }
   ])
   ```

7. **Stop services when done:**
   ```bash
   docker-compose down
   ```

## Option 2: Kubernetes

1. **Build Docker images:**
   ```bash
   ./build-images.sh
   ```

2. **Deploy to Kubernetes:**
   ```bash
   ./deploy-k8s.sh
   ```

3. **Wait for pods to be ready:**
   ```bash
   kubectl get pods -n ecommerce -w
   ```

4. **Get the frontend URL:**
   ```bash
   kubectl get service frontend -n ecommerce
   ```
   
   Access the EXTERNAL-IP in your browser.

5. **Cleanup when done:**
   ```bash
   ./cleanup-k8s.sh
   ```

## Testing the API

### Register a User
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the token from the response!

### Get Products
```bash
curl http://localhost:8000/products
```

### Add to Cart
```bash
curl -X POST http://localhost:8000/cart/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "productId": "PRODUCT_ID_HERE",
    "quantity": 1
  }'
```

## Troubleshooting

### Docker Compose Issues

**Services won't start:**
```bash
# View logs
docker-compose logs

# Restart a specific service
docker-compose restart auth-service
```

**Port already in use:**
```bash
# Stop conflicting services or change ports in docker-compose.yml
```

### Kubernetes Issues

**Pods not starting:**
```bash
# Check pod status
kubectl get pods -n ecommerce

# View logs
kubectl logs <pod-name> -n ecommerce

# Describe pod
kubectl describe pod <pod-name> -n ecommerce
```

**Can't access services:**
```bash
# Check if LoadBalancer is provisioned
kubectl get services -n ecommerce

# Use port-forward as alternative
kubectl port-forward service/frontend 8080:80 -n ecommerce
```

## Next Steps

- Check out the full README.md for detailed documentation
- Explore the API endpoints
- Customize the frontend
- Add more products
- Set up monitoring and logging

## Need Help?

- Read the full README.md
- Check logs: `docker-compose logs` or `kubectl logs`
- Review the architecture diagram in README.md
