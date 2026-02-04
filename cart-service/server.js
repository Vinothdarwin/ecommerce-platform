const express = require('express');
const redis = require('redis');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3003;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002';
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

// Redis Client
const redisClient = redis.createClient({
  url: REDIS_URL
});

redisClient.on('error', (err) => console.error('❌ Redis Client Error', err));
redisClient.on('connect', () => console.log('✅ Connected to Redis'));

(async () => {
  await redisClient.connect();
})();

// Middleware to verify token via auth service
const verifyToken = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    req.user = response.data.user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Helper function to get cart key
const getCartKey = (userId) => `cart:${userId}`;

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'cart-service' });
});

// Get cart
app.get('/', verifyToken, async (req, res) => {
  try {
    const cartKey = getCartKey(req.user.userId);
    const cartData = await redisClient.get(cartKey);
    
    if (!cartData) {
      return res.json({ items: [], total: 0 });
    }

    const cart = JSON.parse(cartData);
    
    // Fetch product details for each item
    const itemsWithDetails = await Promise.all(
      cart.items.map(async (item) => {
        try {
          const response = await axios.get(
            `${PRODUCT_SERVICE_URL}/products/${item.productId}`
          );
          return {
            ...item,
            product: response.data
          };
        } catch (error) {
          console.error(`Error fetching product ${item.productId}:`, error.message);
          return item;
        }
      })
    );

    res.json({
      items: itemsWithDetails,
      total: cart.total
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to cart
app.post('/items', verifyToken, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({ message: 'Invalid product or quantity' });
    }

    // Verify product exists and has stock
    const productResponse = await axios.get(
      `${PRODUCT_SERVICE_URL}/products/${productId}`
    );
    const product = productResponse.data;

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const cartKey = getCartKey(req.user.userId);
    let cart = { items: [], total: 0 };

    const cartData = await redisClient.get(cartKey);
    if (cartData) {
      cart = JSON.parse(cartData);
    }

    // Check if item already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        quantity,
        price: product.price,
        name: product.name
      });
    }

    // Recalculate total
    cart.total = cart.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );

    // Save to Redis with 7 days expiry
    await redisClient.setEx(cartKey, 604800, JSON.stringify(cart));

    res.json({
      message: 'Item added to cart',
      cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    if (error.response?.status === 404) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update cart item quantity
app.put('/items/:productId', verifyToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    const cartKey = getCartKey(req.user.userId);
    const cartData = await redisClient.get(cartKey);

    if (!cartData) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const cart = JSON.parse(cartData);
    const itemIndex = cart.items.findIndex(item => item.productId === productId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity === 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      // Verify stock
      const productResponse = await axios.get(
        `${PRODUCT_SERVICE_URL}/products/${productId}`
      );
      const product = productResponse.data;

      if (product.stock < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }

      cart.items[itemIndex].quantity = quantity;
    }

    // Recalculate total
    cart.total = cart.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );

    await redisClient.setEx(cartKey, 604800, JSON.stringify(cart));

    res.json({
      message: 'Cart updated',
      cart
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart
app.delete('/items/:productId', verifyToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const cartKey = getCartKey(req.user.userId);
    const cartData = await redisClient.get(cartKey);

    if (!cartData) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const cart = JSON.parse(cartData);
    cart.items = cart.items.filter(item => item.productId !== productId);

    // Recalculate total
    cart.total = cart.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );

    await redisClient.setEx(cartKey, 604800, JSON.stringify(cart));

    res.json({
      message: 'Item removed from cart',
      cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear cart
app.delete('/', verifyToken, async (req, res) => {
  try {
    const cartKey = getCartKey(req.user.userId);
    await redisClient.del(cartKey);

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Checkout (simplified - in production would integrate with payment service)
app.post('/checkout', verifyToken, async (req, res) => {
  try {
    const cartKey = getCartKey(req.user.userId);
    const cartData = await redisClient.get(cartKey);

    if (!cartData) {
      return res.status(404).json({ message: 'Cart is empty' });
    }

    const cart = JSON.parse(cartData);

    if (cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Verify stock and update inventory
    for (const item of cart.items) {
      const productResponse = await axios.get(
        `${PRODUCT_SERVICE_URL}/products/${item.productId}`
      );
      const product = productResponse.data;

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}` 
        });
      }

      // Decrease stock
      await axios.patch(
        `${PRODUCT_SERVICE_URL}/products/${item.productId}/stock`,
        { quantity: -item.quantity }
      );
    }

    // Create order object (in production, save to orders database)
    const order = {
      orderId: `ORD-${Date.now()}`,
      userId: req.user.userId,
      items: cart.items,
      total: cart.total,
      status: 'confirmed',
      createdAt: new Date()
    };

    // Clear cart
    await redisClient.del(cartKey);

    res.json({
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ message: 'Server error during checkout' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Cart Service running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await redisClient.quit();
  process.exit(0);
});
