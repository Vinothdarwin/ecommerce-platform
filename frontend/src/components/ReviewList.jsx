import React, { useState, useEffect } from 'react';
import './ReviewList.css';

function ReviewList({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/reviews/products/${productId}`);
      const data = await response.json();
      
      if (response.ok) {
        setReviews(data.reviews || []);
        setStats(data.stats || null);
        setError('');
      } else {
        setError('Failed to load reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading reviews...</div>;
  }

  return (
    <div className="review-list">
      <h2>Customer Reviews</h2>
      
      {stats && stats.totalReviews > 0 && (
        <div className="review-stats">
          <div className="average-rating">
            <span className="rating-number">{stats.averageRating}</span>
            <div className="stars">
              {'★'.repeat(Math.round(stats.averageRating))}
              {'☆'.repeat(5 - Math.round(stats.averageRating))}
            </div>
            <span className="total-reviews">Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}</span>
          </div>
          
          {stats.ratingDistribution && (
            <div className="rating-distribution">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="rating-bar">
                  <span className="rating-label">{rating} ★</span>
                  <div className="bar-container">
                    <div 
                      className="bar-fill" 
                      style={{ 
                        width: `${stats.totalReviews > 0 ? (stats.ratingDistribution[rating] / stats.totalReviews * 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="rating-count">{stats.ratingDistribution[rating]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {reviews.length === 0 ? (
        <div className="no-reviews">
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="reviews">
          {reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <span className="reviewer-name">{review.userName}</span>
                  {review.verifiedPurchase && (
                    <span className="verified-badge">✓ Verified Purchase</span>
                  )}
                </div>
                <div className="review-rating">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
              </div>
              <h4 className="review-title">{review.title}</h4>
              <p className="review-comment">{review.comment}</p>
              <div className="review-footer">
                <span className="review-date">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <div className="review-helpful">
                  <span>Helpful? ({review.helpfulCount})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewList;
