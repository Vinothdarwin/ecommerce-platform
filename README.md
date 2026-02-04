# E-Commerce Microservices Platform

A complete microservices-based e-commerce platform built with Node.js, React, and designed to run on Kubernetes.

## 🏗️ Architecture

This platform consists of the following microservices:

### Backend Services
- **Auth Service** (Port 3001) - User authentication and JWT token management
- **Product Service** (Port 3002) - Product catalog and inventory management
- **Cart Service** (Port 3003) - Shopping cart functionality
- **API Gateway** (Port 8000) - Kong-based API gateway for routing and rate limiting

### Frontend
- **React Frontend** (Port 80) - Modern SPA built with React and Vite

### Infrastructure
- **MongoDB** - NoSQL database for auth and product data
- **Redis** - In-memory cache for cart sessions

## 📋 Prerequisites

- Docker and Docker Compose (for local development)
- Kubernetes cluster (for production deployment)
- kubectl CLI tool
- Node.js 18+ (for local development)

## 🚀 Quick Start

### Option 1: Local Development with Docker Compose

1. **Clone the repository**
   ```bash
   cd ecommerce-microservices
   ```

2. **Build and start all services**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost
   - API Gateway: http://localhost:8000
   - Kong Admin: http://localhost:8001

### Option 2: Kubernetes Deployment

1. **Build Docker images**
   ```bash
   ./build-images.sh
   ```

2. **Deploy to Kubernetes**
   ```bash
   ./deploy-k8s.sh
   ```

3. **Get service URLs**
   ```bash
   kubectl get services -n ecommerce
   ```

4. **Access the application**
   Get the LoadBalancer IP for the frontend service and access it in your browser.

## 📁 Project Structure

```
ecommerce-microservices/
├── auth-service/          # Authentication microservice
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── product-service/       # Product catalog microservice
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── cart-service/          # Shopping cart microservice
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── frontend/              # React frontend application
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── k8s/                   # Kubernetes manifests
│   ├── namespace.yaml
│   ├── config/
│   ├── mongodb/
│   ├── redis/
│   ├── auth/
│   ├── product/
│   ├── cart/
│   ├── gateway/
│   └── frontend/
├── docker-compose.yml
├── kong.yml
└── README.md
```

## 🔧 API Endpoints

### Auth Service (`/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/verify` - Verify JWT token
- `GET /auth/profile` - Get user profile

### Product Service (`/products`)
- `GET /products` - Get all products (with filters)
- `GET /products/:id` - Get single product
- `GET /categories` - Get all categories
- `POST /products` - Create product (admin only)
- `PUT /products/:id` - Update product (admin only)
- `DELETE /products/:id` - Delete product (admin only)

### Cart Service (`/cart`)
- `GET /cart` - Get user's cart
- `POST /cart/items` - Add item to cart
- `PUT /cart/items/:productId` - Update item quantity
- `DELETE /cart/items/:productId` - Remove item from cart
- `DELETE /cart` - Clear cart
- `POST /cart/checkout` - Checkout cart

## 🔐 Authentication

The platform uses JWT-based authentication:

1. Register or login to receive a JWT token
2. Include the token in requests: `Authorization: Bearer <token>`
3. The API Gateway forwards the token to microservices
4. Each service verifies the token with the Auth Service

## 🛠️ Development

### Running Individual Services Locally

#### Auth Service
```bash
cd auth-service
npm install
npm start
```

#### Product Service
```bash
cd product-service
npm install
npm start
```

#### Cart Service
```bash
cd cart-service
npm install
npm start
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Each service has an `.env.example` file. Copy it to `.env` and adjust as needed:

```bash
cp .env.example .env
```

## 🎨 Frontend Features

- User registration and login
- Product browsing with search and filters
- Product detail pages
- Shopping cart management
- Responsive design
- JWT-based session management

## 🗄️ Database Schema

### Users Collection (MongoDB - Auth DB)
```javascript
{
  email: String,
  password: String (hashed),
  firstName: String,
  lastName: String,
  role: String (customer/admin),
  createdAt: Date
}
```

### Products Collection (MongoDB - Products DB)
```javascript
{
  name: String,
  description: String,
  price: Number,
  category: String,
  imageUrl: String,
  stock: Number,
  sku: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Cart Data (Redis)
```javascript
{
  items: [
    {
      productId: String,
      quantity: Number,
      price: Number,
      name: String
    }
  ],
  total: Number
}
```

## 🔄 Scaling

### Horizontal Pod Autoscaling (HPA)

```bash
kubectl autoscale deployment auth-service -n ecommerce --cpu-percent=70 --min=2 --max=10
kubectl autoscale deployment product-service -n ecommerce --cpu-percent=70 --min=2 --max=10
kubectl autoscale deployment cart-service -n ecommerce --cpu-percent=70 --min=2 --max=10
```

## 📊 Monitoring

### Check Pod Status
```bash
kubectl get pods -n ecommerce
```

### View Logs
```bash
kubectl logs -f <pod-name> -n ecommerce
```

### View Service Status
```bash
kubectl get services -n ecommerce
```

## 🧪 Testing the API

### Register a User
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Products
```bash
curl http://localhost:8000/products
```

### Add to Cart (with token)
```bash
curl -X POST http://localhost:8000/cart/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "productId": "<product-id>",
    "quantity": 1
  }'
```

## 🛡️ Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Rate limiting via API Gateway
- Input validation
- Environment-based secrets

## 🐛 Troubleshooting

### Services not starting
```bash
# Check pod status
kubectl get pods -n ecommerce

# View pod logs
kubectl logs <pod-name> -n ecommerce

# Describe pod for events
kubectl describe pod <pod-name> -n ecommerce
```

### Database connection issues
```bash
# Check MongoDB pod
kubectl get pod -l app=mongo -n ecommerce

# Check Redis pod
kubectl get pod -l app=redis -n ecommerce
```

### API Gateway not routing
```bash
# Check Kong configuration
kubectl logs -l app=api-gateway -n ecommerce

# Verify Kong config
kubectl get configmap kong-config -n ecommerce -o yaml
```

## 📝 Adding New Products (Admin)

To add sample products, you need to:

1. Register as an admin user (manually update role in database)
2. Login to get JWT token
3. Use the token to create products via API

Or insert directly into MongoDB:

```javascript
use ecommerce-products

db.products.insertMany([
  {
    name: "Laptop",
    description: "High-performance laptop",
    price: 999.99,
    category: "Electronics",
    imageUrl: "https://via.placeholder.com/300",
    stock: 50,
    sku: "LAP-001",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "T-Shirt",
    description: "Comfortable cotton t-shirt",
    price: 19.99,
    category: "Clothing",
    imageUrl: "https://via.placeholder.com/300",
    stock: 100,
    sku: "TSH-001",
    createdAt: new Date(),
    updatedAt: new Date()
  }
])
```

## 🔄 Updates and Maintenance

### Update a Service
1. Make code changes
2. Build new Docker image
3. Push to registry (if using one)
4. Update Kubernetes deployment:
   ```bash
   kubectl set image deployment/auth-service auth-service=ecommerce/auth-service:v2 -n ecommerce
   ```

### Backup Database
```bash
# Backup MongoDB
kubectl exec -it <mongo-pod> -n ecommerce -- mongodump --out /backup

# Copy backup from pod
kubectl cp ecommerce/<mongo-pod>:/backup ./mongodb-backup
```

## 🌐 Production Considerations

1. **Use managed databases** (MongoDB Atlas, AWS ElastiCache)
2. **Set up proper secrets management** (Kubernetes Secrets, Vault)
3. **Configure SSL/TLS** for API Gateway
4. **Set up logging and monitoring** (Prometheus, Grafana, ELK)
5. **Implement CI/CD** pipeline
6. **Configure auto-scaling** based on metrics
7. **Set up backup and disaster recovery**
8. **Use container registry** (Docker Hub, ECR, GCR)

## 📄 License

This project is open-source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests.

## 📞 Support

For issues and questions, please open an issue in the repository.
