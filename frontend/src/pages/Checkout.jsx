import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Checkout.css';

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    notes: '',
    time_slot: '',
    is_heart_shape: false,
  });

  useEffect(() => {
    fetch('/api/slots/today')
      .then(r => r.json())
      .then(data => {
        setSlots(Array.isArray(data) ? data.filter(s => !s.is_booked) : []);
        setSlotsLoading(false);
      })
      .catch(() => setSlotsLoading(false));
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

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
          customer_name: form.customer_name,
          customer_phone: form.customer_phone,
          notes: form.notes,
          items: items.map(i => ({ id: i.id, quantity: i.quantity })),
          time_slot: form.time_slot || null,
          is_heart_shape: form.is_heart_shape ? 1 : 0,
          order_type: 'Standard',
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
          <p>Almost there! Fill in your details for pickup</p>
        </div>
      </div>

      <div className="page-container checkout-content">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="checkout-main">
            <div className="card checkout-card">
              <h2 className="checkout-card-title">Your Details</h2>

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

              {/* Time Slot Picker */}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Pickup Time Slot *</span>
                  {!slotsLoading && slots.length > 0 && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#1a7a3c', background: '#F0FFF4', padding: '2px 8px', borderRadius: 12 }}>
                      {slots.length} slot{slots.length !== 1 ? 's' : ''} available
                    </span>
                  )}
                </label>
                {slotsLoading ? (
                  <p style={{ color: 'var(--text-light)', fontSize: 14 }}>Loading slots...</p>
                ) : slots.length === 0 ? (
                  <div style={{ background: '#FFF0F0', border: '1px solid #f5c6c6', borderRadius: 8, padding: '12px 16px' }}>
                    <p style={{ color: '#C0161C', fontSize: 14, fontWeight: 600, margin: 0 }}>
                      ❌ No pickup slots available today
                    </p>
                    <p style={{ color: '#C0161C', fontSize: 13, margin: '4px 0 0' }}>
                      Please call us to arrange your order.
                    </p>
                  </div>
                ) : (
                  <select className="form-control" name="time_slot" value={form.time_slot} onChange={handleChange} required>
                    <option value="">— Select a time slot —</option>
                    {slots.map(s => (
                      <option key={s.id} value={s.slot_time}>{s.slot_time}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Heart shape */}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" name="is_heart_shape" checked={form.is_heart_shape} onChange={handleChange} />
                  Make it heart-shaped ❤️ (for pizzas)
                </label>
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
                <div className="total-line grand"><span>Total</span><span>₹{subtotal}</span></div>
              </div>

              {error && <div className="checkout-error">{error}</div>}

              {!slotsLoading && slots.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                  <p style={{ color: '#C0161C', fontWeight: 700, marginBottom: 6 }}>Online ordering unavailable</p>
                  <p style={{ color: 'var(--text-light)', fontSize: 13 }}>No pickup slots left today. Please call us directly.</p>
                </div>
              ) : (
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 20 }}
                  disabled={submitting || slotsLoading}>
                  {submitting ? 'Placing Order...' : `Place Order — ₹${subtotal}`}
                </button>
              )}
              <p className="checkout-note">🏠 Pickup only &nbsp;|&nbsp; Cash on pickup</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
