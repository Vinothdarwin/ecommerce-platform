const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/ecommerce-reviews';
const PORT = process.env.PORT || 3004;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Review Schema
const reviewSchema = new mongoose.Schema({
  productId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true, maxlength: 100 },
  comment: { type: String, required: true, maxlength: 2000 },
  images: [{ type: String }],
  verifiedPurchase: { type: Boolean, default: false },
  helpfulCount: { type: Number, default: 0 },
  unhelpfulCount: { type: Number, default: 0 },
  helpfulVotes: [{ userId: String, helpful: Boolean }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

// Middleware to verify token
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

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'review-service' });
});

// Get reviews for a product
app.get('/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', rating } = req.query;

    const filter = { productId, status: 'approved' };
    if (rating) filter.rating = parseInt(rating);

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const reviews = await Review.find(filter)
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Review.countDocuments(filter);

    // Calculate stats
    const allReviews = await Review.find({ productId, status: 'approved' });
    const sum = allReviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = allReviews.length > 0 ? (sum / allReviews.length).toFixed(1) : 0;

    const stats = {
      averageRating: parseFloat(averageRating),
      totalReviews: allReviews.length,
      ratingDistribution: {
        5: allReviews.filter(r => r.rating === 5).length,
        4: allReviews.filter(r => r.rating === 4).length,
        3: allReviews.filter(r => r.rating === 3).length,
        2: allReviews.filter(r => r.rating === 2).length,
        1: allReviews.filter(r => r.rating === 1).length,
      }
    };

    res.json({
      reviews,
      stats,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create review
app.post('/', [
  verifyToken,
  body('productId').notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('title').trim().isLength({ min: 5, max: 100 }),
  body('comment').trim().isLength({ min: 10, max: 2000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, rating, title, comment, images } = req.body;

    // Check if user already reviewed
    const existingReview = await Review.findOne({ productId, userId: req.user.userId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = new Review({
      productId,
      userId: req.user.userId,
      userName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Anonymous',
      rating,
      title,
      comment,
      images: images || []
    });

    await review.save();

    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's reviews
app.get('/user/my-reviews', verifyToken, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Review Service running on port ${PORT}`);
});