import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Checkout.css';

export default function Checkout() {
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    notes: '',
  });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  if (items.length === 0) {
    return (
      <div className="checkout-empty page-container">
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add items before checking out</p>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/menu')}>
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map(i => ({ id: i.id, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');
      clearCart();
      navigate('/order-confirmation', { state: { order: data } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-hero">
        <div className="page-container">
          <h1>Checkout</h1>
          <p>Almost there! Fill in your delivery details</p>
        </div>
      </div>

      <div className="page-container checkout-content">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="checkout-main">
            <div className="card checkout-card">
              <h2 className="checkout-card-title">Delivery Details</h2>

              <div className="form-group">
                <label>Full Name *</label>
                <input className="form-control" name="customer_name" value={form.customer_name}
                  onChange={handleChange} placeholder="Your full name" required />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input className="form-control" name="customer_phone" value={form.customer_phone}
                  onChange={handleChange} placeholder="+91 98765 43210" required type="tel" />
              </div>
              <div className="form-group">
                <label>Delivery Address *</label>
                <textarea className="form-control" name="customer_address" value={form.customer_address}
                  onChange={handleChange} placeholder="House/flat no., street, landmark, Goa" required rows={3} />
              </div>
              <div className="form-group">
                <label>Special Instructions <span style={{ fontWeight: 400, color: 'var(--text-light)' }}>(optional)</span></label>
                <textarea className="form-control" name="notes" value={form.notes}
                  onChange={handleChange} placeholder="e.g. Extra cheese, no onions, ring doorbell..." rows={2} />
              </div>
            </div>
          </div>

          <div className="checkout-sidebar">
            <div className="card checkout-card">
              <h2 className="checkout-card-title">Your Order</h2>
              <div className="order-items">
                {items.map(item => (
                  <div key={item.id} className="order-item-row">
                    <span className="order-item-emoji">{item.emoji}</span>
                    <span className="order-item-name">{item.name}</span>
                    <span className="order-item-qty">×{item.quantity}</span>
                    <span className="order-item-price">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="order-totals">
                <div className="total-line"><span>Subtotal</span><span>₹{subtotal}</span></div>
                <div className="total-line"><span>Delivery fee</span><span>₹{deliveryFee}</span></div>
                <div className="total-line grand"><span>Total</span><span>₹{total}</span></div>
              </div>

              {error && <div className="checkout-error">{error}</div>}

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 20 }} disabled={submitting}>
                {submitting ? 'Placing Order...' : `Place Order — ₹${total}`}
              </button>
              <p className="checkout-note">🛵 Delivery fee: ₹50 &nbsp;|&nbsp; Cash on delivery</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
