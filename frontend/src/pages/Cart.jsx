import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI } from '../services/api';
import './Cart.css';

function Cart({ setCartCount }) {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.get();
      setCart(response.data);
      setCartCount(response.data.items.reduce((sum, item) => sum + item.quantity, 0));
      setError('');
    } catch (err) {
      setError('Failed to fetch cart');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      await cartAPI.updateItem(productId, { quantity: newQuantity });
      fetchCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await cartAPI.removeItem(productId);
      fetchCart();
    } catch (err) {
      setError('Failed to remove item');
    }
  };

  const handleProceedToCheckout = () => {
    // Navigate to checkout page with cart data
    navigate('/checkout', { 
      state: { 
        cartItems: cart.items, 
        totalAmount: cart.total 
      } 
    });
  };

  if (loading) {
    return <div className="loading">Loading cart...</div>;
  }

  return (
    <div className="cart-page container">
      <h1>Shopping Cart</h1>

      {error && <div className="error">{error}</div>}

      {cart.items.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button onClick={() => navigate('/products')} className="btn btn-primary">
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item.productId} className="cart-item card">
                {item.product && (
                  <>
                    <img src={item.product.imageUrl} alt={item.product.name} />
                    <div className="cart-item-details">
                      <h3>{item.product.name}</h3>
                      <p className="cart-item-price">${item.price.toFixed(2)}</p>
                      <div className="cart-item-quantity">
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                        >
                          +
                        </button>
                      </div>
                      <p className="cart-item-total">
                        Subtotal: ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      className="btn btn-danger remove-btn"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="cart-summary card">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleProceedToCheckout}
              className="btn btn-success btn-block btn-large"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
