import React, { useState, useEffect, useCallback, useRef } from 'react';
import AdminNav from '../../components/AdminNav';
import './Admin.css';

const STATUSES = ['all', 'Received', 'In Kitchen', 'Ready', 'Done', 'Cancelled'];
const STATUS_BADGE = {
  Received: 'badge-pending',
  'In Kitchen': 'badge-preparing',
  Ready: 'badge-ready',
  Done: 'badge-delivered',
  Cancelled: 'badge-cancelled',
};
const NEXT_STATUS = {
  Received: 'In Kitchen',
  'In Kitchen': 'Ready',
  Ready: 'Done',
};
const SOURCE_STYLE = {
  Swiggy:   { background: '#FF6900', color: 'white' },
  Zomato:   { background: '#E23744', color: 'white' },
  'Walk-in':{ background: '#1877F2', color: 'white' },
  Phone:    { background: '#28a745', color: 'white' },
  Website:  { background: '#6c757d', color: 'white' },
};

const EMPTY_FORM = {
  customer_name: '', customer_phone: '', order_source: 'Walk-in',
  time_slot: '', pizza_id: '', size: '', is_heart_shape: false, notes: '', order_type: 'Standard',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState(EMPTY_FORM);
  const [menuItems, setMenuItems] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const prevCountRef = useRef(null);
  const token = localStorage.getItem('admin_token');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchOrders = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    const url = statusFilter === 'all' ? '/api/orders' : `/api/orders?status=${encodeURIComponent(statusFilter)}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const fetched = Array.isArray(data) ? data : [];
        if (silent && prevCountRef.current !== null && fetched.length > prevCountRef.current) {
          showToast(`🍕 ${fetched.length - prevCountRef.current} new order(s) arrived!`, 'new');
        }
        prevCountRef.current = fetched.length;
        setOrders(fetched);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [statusFilter, token]);

  useEffect(() => {
    prevCountRef.current = null;
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const id = setInterval(() => fetchOrders(true), 30000);
    return () => clearInterval(id);
  }, [fetchOrders]);

  const openManualModal = () => {
    fetch('/api/menu', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setMenuItems(Array.isArray(d) ? d : []));
    fetch('/api/slots/today')
      .then(r => r.json()).then(d => setAvailableSlots(Array.isArray(d) ? d.filter(s => !s.is_booked) : []));
    setManualForm(EMPTY_FORM);
    setShowManualModal(true);
  };

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

  const submitManualOrder = async (e) => {
    e.preventDefault();
    const pizzaItem = menuItems.find(m => m.id === parseInt(manualForm.pizza_id));
    if (!pizzaItem) { showToast('Please select a menu item', 'error'); return; }
    if (pizzaItem.sizes && !manualForm.size) { showToast('Please select a size', 'error'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          customer_name: manualForm.customer_name,
          customer_phone: manualForm.customer_phone,
          customer_address: '',
          items: [{ id: pizzaItem.id, quantity: 1, size: pizzaItem.sizes ? manualForm.size : undefined }],
          notes: manualForm.notes,
          order_source: manualForm.order_source,
          time_slot: manualForm.time_slot || null,
          is_heart_shape: manualForm.is_heart_shape ? 1 : 0,
          order_type: manualForm.order_type,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');
      setShowManualModal(false);
      fetchOrders();
      showToast('Order added successfully!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-layout">
      <AdminNav />
      <main className="admin-main">
        {toast && (
          <div style={{
            position: 'fixed', top: 20, right: 20, zIndex: 9999,
            background: toast.type === 'error' ? '#C0161C' : '#28a745',
            color: 'white', padding: '12px 20px', borderRadius: 8,
            fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.2)', maxWidth: 320,
          }}>
            {toast.msg}
          </div>
        )}

        <div className="admin-header">
          <div>
            <h1>Orders</h1>
            <p>Manage and track all customer orders</p>
          </div>
          <button className="btn btn-primary" onClick={openManualModal}>+ Add Manual Order</button>
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
                    <th>Source</th>
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
                        {order.is_heart_shape ? ' ❤️' : ''}
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
                      <td>
                        <span style={{
                          padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                          ...(SOURCE_STYLE[order.order_source] || SOURCE_STYLE.Website),
                        }}>
                          {order.order_source || 'Website'}
                        </span>
                      </td>
                      <td className="cell-sub">
                        {new Date(order.created_at + 'Z').toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}
                        {order.time_slot && <div style={{ color: 'var(--teal)', fontWeight: 600 }}>🕐 {order.time_slot}</div>}
                      </td>
                      <td>
                        <div className="action-btns">
                          {NEXT_STATUS[order.status] && (
                            <button className="btn btn-primary btn-sm" disabled={updating === order.id}
                              onClick={() => updateStatus(order.id, NEXT_STATUS[order.status])}>
                              {updating === order.id ? '...' : `→ ${NEXT_STATUS[order.status]}`}
                            </button>
                          )}
                          {order.status !== 'Cancelled' && order.status !== 'Done' && (
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
                <h2>Order #{String(selectedOrder.id).padStart(4, '0')}{selectedOrder.is_heart_shape ? ' ❤️' : ''}</h2>
                <button className="modal-close" onClick={() => setSelectedOrder(null)}>✕</button>
              </div>

              <div className="modal-section">
                <h4>Customer</h4>
                <p><strong>{selectedOrder.customer_name}</strong></p>
                <p>📞 {selectedOrder.customer_phone}</p>
                {selectedOrder.customer_address && <p>📍 {selectedOrder.customer_address}</p>}
                {selectedOrder.notes && <p>📝 {selectedOrder.notes}</p>}
                {selectedOrder.time_slot && <p>🕐 Slot: {selectedOrder.time_slot}</p>}
                <p style={{ marginTop: 6 }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700,
                    ...(SOURCE_STYLE[selectedOrder.order_source] || SOURCE_STYLE.Website),
                  }}>
                    {selectedOrder.order_source || 'Website'}
                  </span>
                  {selectedOrder.order_type && selectedOrder.order_type !== 'Standard' && (
                    <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-light)' }}>· {selectedOrder.order_type}</span>
                  )}
                </p>
              </div>

              <div className="modal-section">
                <h4>Items</h4>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="modal-item-row">
                    <span>
                      {item.emoji} {item.name}
                      {item.description && <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-light)', marginTop: 2 }}>{item.description}</div>}
                    </span>
                    <span>×{item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="modal-total"><span>Subtotal</span><span>₹{selectedOrder.subtotal}</span></div>
                <div className="modal-total"><span>Delivery</span><span>₹{selectedOrder.delivery_fee}</span></div>
                <div className="modal-total grand"><span>Total</span><span>₹{selectedOrder.total}</span></div>
              </div>

              <div className="modal-section">
                <h4>Update Status</h4>
                <div className="status-btns">
                  {['Received', 'In Kitchen', 'Ready', 'Done', 'Cancelled'].map(s => (
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

        {/* Manual Order Modal */}
        {showManualModal && (
          <div className="modal-overlay" onClick={() => setShowManualModal(false)}>
            <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add Manual Order</h2>
                <button className="modal-close" onClick={() => setShowManualModal(false)}>✕</button>
              </div>
              <form onSubmit={submitManualOrder}>
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Customer Name *</label>
                    <input className="form-control" value={manualForm.customer_name} required
                      onChange={e => setManualForm(f => ({ ...f, customer_name: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Phone *</label>
                    <input className="form-control" value={manualForm.customer_phone} required
                      onChange={e => setManualForm(f => ({ ...f, customer_phone: e.target.value }))} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Order Source *</label>
                    <select className="form-control" value={manualForm.order_source}
                      onChange={e => {
                        const src = e.target.value;
                        setManualForm(f => ({
                          ...f,
                          order_source: src,
                          time_slot: ['Website', 'Walk-in'].includes(src) ? f.time_slot : '',
                        }));
                      }}>
                      <option>Swiggy</option>
                      <option>Zomato</option>
                      <option>Walk-in</option>
                      <option>Phone</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Order Type</label>
                    <select className="form-control" value={manualForm.order_type}
                      onChange={e => setManualForm(f => ({ ...f, order_type: e.target.value }))}>
                      <option>Standard</option>
                      <option>Special Request</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Pizza / Item *</label>
                  <select className="form-control" value={manualForm.pizza_id} required
                    onChange={e => setManualForm(f => ({ ...f, pizza_id: e.target.value, size: '' }))}>
                    <option value="">— Select item —</option>
                    {menuItems.map(m => (
                      <option key={m.id} value={m.id}>{m.emoji} {m.name} — {m.sizes ? `From ₹${m.price}` : `₹${m.price}`}</option>
                    ))}
                  </select>
                </div>
                {(() => {
                  const selected = menuItems.find(m => m.id === parseInt(manualForm.pizza_id));
                  if (!selected?.sizes) return null;
                  const sizeMap = JSON.parse(selected.sizes);
                  return (
                    <div className="form-group">
                      <label>Size *</label>
                      <select className="form-control" value={manualForm.size} required
                        onChange={e => setManualForm(f => ({ ...f, size: e.target.value }))}>
                        <option value="">— Select size —</option>
                        {Object.entries(sizeMap).map(([label, price]) => (
                          <option key={label} value={label}>{label} — ₹{price}</option>
                        ))}
                      </select>
                    </div>
                  );
                })()}
                {['Website', 'Walk-in'].includes(manualForm.order_source) && (
                  <div className="form-group">
                    <label>Time Slot</label>
                    <select className="form-control" value={manualForm.time_slot}
                      onChange={e => setManualForm(f => ({ ...f, time_slot: e.target.value }))}>
                      <option value="">— No slot —</option>
                      {availableSlots.map(s => (
                        <option key={s.id} value={s.slot_time}>{s.slot_time}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label>Notes</label>
                  <textarea className="form-control" rows={2} value={manualForm.notes}
                    onChange={e => setManualForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input type="checkbox" checked={manualForm.is_heart_shape}
                      onChange={e => setManualForm(f => ({ ...f, is_heart_shape: e.target.checked }))} />
                    Make it heart-shaped ❤️ (for pizzas)
                  </label>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowManualModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Adding...' : 'Add Order'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
