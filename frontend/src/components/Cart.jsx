import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

export default function Cart() {
  const { items, removeItem, updateQuantity, itemCount, subtotal, isOpen, setIsOpen } = useCart();
  const navigate = useNavigate();
  const [availableSlots, setAvailableSlots] = useState(null); // null = loading

  useEffect(() => {
    if (!isOpen || items.length === 0) return;
    fetch('/api/slots/today')
      .then(r => r.json())
      .then(data => setAvailableSlots(Array.isArray(data) ? data.filter(s => !s.is_booked).length : 0))
      .catch(() => setAvailableSlots(0));
  }, [isOpen, items.length]);

  if (!isOpen) return null;

  const noSlots = availableSlots === 0;

  const handleCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <div className="cart-overlay" onClick={() => setIsOpen(false)} />
      <div className="cart-drawer">
        <div className="cart-header">
          <h2>Your Order <span className="cart-header-count">{itemCount} item{itemCount !== 1 ? 's' : ''}</span></h2>
          <button className="cart-close" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some delicious pizzas!</p>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setIsOpen(false)}>
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-emoji">{item.emoji}</div>
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">₹{item.price} each</div>
                  </div>
                  <div className="cart-item-controls">
                    <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                    <span className="qty-value">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <div className="cart-item-total">₹{item.price * item.quantity}</div>
                  <button className="cart-item-remove" onClick={() => removeItem(item.id)}>🗑</button>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-summary">
                <div className="summary-row total-row">
                  <span>Total</span>
                  <span>₹{subtotal}</span>
                </div>
              </div>
              {availableSlots !== null && (
                <div style={{
                  padding: '8px 12px', borderRadius: 8, marginBottom: 10, fontSize: 13, fontWeight: 600,
                  background: noSlots ? '#FFF0F0' : '#F0FFF4',
                  color: noSlots ? '#C0161C' : '#1a7a3c',
                  textAlign: 'center',
                }}>
                  {noSlots
                    ? '❌ No pickup slots available today'
                    : `✅ ${availableSlots} pickup slot${availableSlots !== 1 ? 's' : ''} available today`
                  }
                </div>
              )}
              <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleCheckout}
                disabled={noSlots}>
                {noSlots ? 'Ordering Unavailable' : 'Proceed to Checkout →'}
              </button>
              {noSlots && (
                <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-light)', marginTop: 8 }}>
                  Please call us to place your order.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
