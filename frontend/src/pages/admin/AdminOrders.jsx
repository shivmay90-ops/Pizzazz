import React, { useState, useEffect, useCallback } from 'react';
import AdminNav from '../../components/AdminNav';
import './Admin.css';

const STATUSES = ['all', 'Pending', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'];
const STATUS_BADGE = {
  Pending: 'badge-pending',
  Preparing: 'badge-preparing',
  Ready: 'badge-ready',
  'Out for Delivery': 'badge-out',
  Delivered: 'badge-delivered',
  Cancelled: 'badge-cancelled',
};
const NEXT_STATUS = {
  Pending: 'Preparing',
  Preparing: 'Ready',
  Ready: 'Out for Delivery',
  'Out for Delivery': 'Delivered',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(null);
  const token = localStorage.getItem('admin_token');

  const fetchOrders = useCallback(() => {
    const url = statusFilter === 'all' ? '/api/orders' : `/api/orders?status=${encodeURIComponent(statusFilter)}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [statusFilter, token]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      const updated = await res.json();
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(updated);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="admin-layout">
      <AdminNav />
      <main className="admin-main">
        <div className="admin-header">
          <h1>Orders</h1>
          <p>Manage and track all customer orders</p>
        </div>

        <div className="filter-tabs">
          {STATUSES.map(s => (
            <button key={s} className={`filter-tab ${statusFilter === s ? 'active' : ''}`}
              onClick={() => { setStatusFilter(s); setLoading(true); }}>
              {s === 'all' ? 'All Orders' : s}
            </button>
          ))}
        </div>

        {loading ? <div className="spinner" /> : (
          orders.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📋</div><h3>No orders found</h3></div>
          ) : (
            <div className="card">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>
                        <button className="order-id-btn" onClick={() => setSelectedOrder(order)}>
                          #{String(order.id).padStart(4, '0')}
                        </button>
                      </td>
                      <td>
                        <div className="cell-name">{order.customer_name}</div>
                        <div className="cell-sub">{order.customer_phone}</div>
                      </td>
                      <td>
                        <div className="cell-items">
                          {order.items.slice(0, 2).map((it, i) => (
                            <span key={i}>{it.emoji} {it.name}{it.quantity > 1 ? ` ×${it.quantity}` : ''}</span>
                          ))}
                          {order.items.length > 2 && <span className="cell-sub">+{order.items.length - 2} more</span>}
                        </div>
                      </td>
                      <td><strong>₹{order.total}</strong></td>
                      <td><span className={`badge ${STATUS_BADGE[order.status] || ''}`}>{order.status}</span></td>
                      <td className="cell-sub">{new Date(order.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                      <td>
                        <div className="action-btns">
                          {NEXT_STATUS[order.status] && (
                            <button className="btn btn-primary btn-sm" disabled={updating === order.id}
                              onClick={() => updateStatus(order.id, NEXT_STATUS[order.status])}>
                              {updating === order.id ? '...' : `→ ${NEXT_STATUS[order.status]}`}
                            </button>
                          )}
                          {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                            <button className="btn btn-ghost btn-sm" disabled={updating === order.id}
                              onClick={() => updateStatus(order.id, 'Cancelled')}>
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Order detail modal */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Order #{String(selectedOrder.id).padStart(4, '0')}</h2>
                <button className="modal-close" onClick={() => setSelectedOrder(null)}>✕</button>
              </div>

              <div className="modal-section">
                <h4>Customer</h4>
                <p><strong>{selectedOrder.customer_name}</strong></p>
                <p>📞 {selectedOrder.customer_phone}</p>
                <p>📍 {selectedOrder.customer_address}</p>
                {selectedOrder.notes && <p>📝 {selectedOrder.notes}</p>}
              </div>

              <div className="modal-section">
                <h4>Items</h4>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="modal-item-row">
                    <span>{item.emoji} {item.name}</span>
                    <span>×{item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="modal-total">
                  <span>Subtotal</span><span>₹{selectedOrder.subtotal}</span>
                </div>
                <div className="modal-total">
                  <span>Delivery</span><span>₹{selectedOrder.delivery_fee}</span>
                </div>
                <div className="modal-total grand">
                  <span>Total</span><span>₹{selectedOrder.total}</span>
                </div>
              </div>

              <div className="modal-section">
                <h4>Update Status</h4>
                <div className="status-btns">
                  {['Pending', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'].map(s => (
                    <button key={s}
                      className={`btn btn-sm ${selectedOrder.status === s ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => updateStatus(selectedOrder.id, s)}
                      disabled={updating === selectedOrder.id || selectedOrder.status === s}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
