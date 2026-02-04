import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, cartAPI } from '../services/api';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import './ProductDetail.css';

function ProductDetail({ user, setCartCount }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); 
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');
  const [reviewsKey, setReviewsKey] = useState(0); // For refreshing reviews

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getById(id);
      setProduct(response.data);
      setError('');
    } catch (err) {
      setError('Product not found');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setAdding(true);
      await cartAPI.addItem({ productId: id, quantity });
      setMessage('Added to cart successfully!');
      setCartCount((prev) => prev + quantity);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleReviewSubmitted = () => {
    setReviewsKey(prev => prev + 1); // Force refresh reviews list
  };

  if (loading) {
    return <div className="loading">Loading product...</div>;
  }

  if (error && !product) {
    return <div className="error container">{error}</div>;
  }

  return (
    <div className="product-detail container">
      <div className="product-detail-content">
        <div className="product-image">
          <img src={product.imageUrl} alt={product.name} />
        </div>
        
        <div className="product-details">
          <h1>{product.name}</h1>
          <p className="product-category">{product.category}</p>
          <p className="product-price">${product.price.toFixed(2)}</p>
          
          <div className="product-stock-info">
            {product.stock > 0 ? (
              <span className="in-stock">✓ In Stock ({product.stock} available)</span>
            ) : (
              <span className="out-of-stock">✗ Out of Stock</span>
            )}
          </div>

          <p className="product-description">{product.description}</p>

          {product.stock > 0 && (
            <div className="add-to-cart-section">
              <div className="quantity-selector">
                <label>Quantity:</label>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                />
              </div>
              
              <button
                onClick={handleAddToCart}
                className="btn btn-primary btn-large"
                disabled={adding}
              >
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          )}

          {message && <div className="success">{message}</div>}
          {error && <div className="error">{error}</div>}

          <div className="product-meta">
            <p><strong>SKU:</strong> {product.sku}</p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <hr />
        
        {/* Show review form only if user is logged in */}
        {user ? (
          <ReviewForm 
            productId={id} 
            onReviewSubmitted={handleReviewSubmitted}
          />
        ) : (
          <div className="review-login-prompt">
            <p>Please <a href="/login">login</a> to write a review.</p>
          </div>
        )}

        {/* Always show reviews list */}
        <ReviewList productId={id} key={reviewsKey} />
      </div>
    </div>
  );
}

export default ProductDetail;
