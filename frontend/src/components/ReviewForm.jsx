import React, { useState } from 'react';
import './ReviewForm.css';

function ReviewForm({ productId, onReviewSubmitted }) {
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (formData.title.length < 5) {
      setError('Title must be at least 5 characters');
      setLoading(false);
      return;
    }

    if (formData.comment.length < 10) {
      setError('Comment must be at least 10 characters');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to submit a review');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          rating: formData.rating,
          title: formData.title,
          comment: formData.comment
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Review submitted successfully!');
        setFormData({ rating: 5, title: '', comment: '' });
        if (onReviewSubmitted) {
          setTimeout(() => onReviewSubmitted(), 1000);
        }
      } else {
        setError(data.message || 'Failed to submit review');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Submit review error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-form">
      <h3>Write a Review</h3>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Rating</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= formData.rating ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, rating: star })}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Title (5-100 characters)</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Summarize your review"
            maxLength="100"
            required
          />
          <small>{formData.title.length}/100</small>
        </div>

        <div className="form-group">
          <label>Review (10-2000 characters)</label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            placeholder="Share your experience with this product"
            rows="5"
            maxLength="2000"
            required
          />
          <small>{formData.comment.length}/2000</small>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}

export default ReviewForm;
