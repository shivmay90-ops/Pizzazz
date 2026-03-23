import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './OrderConfirmation.css';

export default function OrderConfirmation() {
  const { state } = useLocation();
  const order = state?.order;

  if (!order) {
    return (
      <div className="page-container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>No order found</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>Go Home</Link>
      </div>
    );
  }

  return (
    <div className="confirmation-page">
      <div className="confirmation-hero">
        <div className="check-circle">✓</div>
        <h1>Order Placed!</h1>
        <p>Thanks {order.customer_name}! Your pizza is on its way 🛵</p>
      </div>

      <div className="page-container confirmation-content">
        <div className="card confirmation-card">
          <div className="order-id-banner">
            Order #{String(order.id).padStart(4, '0')}
          </div>

          <div className="confirmation-details">
            <div className="detail-section">
              <h3>Delivery To</h3>
              <p><strong>{order.customer_name}</strong></p>
              <p>📞 {order.customer_phone}</p>
              <p>📍 {order.customer_address}</p>
            </div>

            <div className="detail-section">
              <h3>Order Status</h3>
              <div className="status-track">
                {['Pending', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'].map((step, i) => (
                  <div key={step} className={`status-step ${i === 0 ? 'active' : ''}`}>
                    <div className="step-dot" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="confirmation-items">
            <h3>Items Ordered</h3>
            {order.items.map((item, i) => (
              <div key={i} className="conf-item-row">
                <span>{item.emoji} {item.name}</span>
                <span>×{item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="conf-totals">
              <div className="conf-total-line"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
              <div className="conf-total-line"><span>Delivery</span><span>₹{order.delivery_fee}</span></div>
              <div className="conf-total-line grand"><span>Total</span><span>₹{order.total}</span></div>
            </div>
          </div>

          {order.notes && (
            <div className="conf-notes">
              <strong>📝 Notes:</strong> {order.notes}
            </div>
          )}

          <div className="conf-actions">
            <Link to="/menu" className="btn btn-primary">Order Again 🍕</Link>
            <Link to="/" className="btn btn-ghost">Back to Home</Link>
          </div>
        </div>

        <div className="est-delivery">
          <span className="est-icon">⏱</span>
          <div>
            <strong>Estimated delivery time</strong>
            <p>30–45 minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
