import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminNav from '../../components/AdminNav';
import './Admin.css';

const STATUS_BADGE = {
  Received: 'badge-pending',
  'In Kitchen': 'badge-preparing',
  Ready: 'badge-ready',
  Done: 'badge-delivered',
  Cancelled: 'badge-cancelled',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSpecialModal, setShowSpecialModal] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedSpecialId, setSelectedSpecialId] = useState('');
  const [savingSpecial, setSavingSpecial] = useState(false);
  const token = localStorage.getItem('admin_token');

  const fetchStats = useCallback(() => {
    fetch('/api/orders/stats/summary', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const id = setInterval(fetchStats, 30000);
    return () => clearInterval(id);
  }, [fetchStats]);

  const openSpecialModal = () => {
    fetch('/api/menu', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setMenuItems(Array.isArray(d) ? d : []));
    setSelectedSpecialId(stats?.todaySpecial?.id || '');
    setShowSpecialModal(true);
  };

  const saveSpecial = async () => {
    if (!selectedSpecialId) return;
    setSavingSpecial(true);
    try {
      await fetch(`/api/menu/${selectedSpecialId}/special`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowSpecialModal(false);
      fetchStats();
    } finally {
      setSavingSpecial(false);
    }
  };

  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
  const orderCap = stats?.orderCap || 30;
  const todayCount = stats?.todayCount || 0;
  const capPct = Math.min((todayCount / orderCap) * 100, 100);

  return (
    <div className="admin-layout">
      <AdminNav />
      <main className="admin-main">
        <div className="admin-header">
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening at Pizzazz Goa</p>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : stats ? (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#FFF3CD' }}>📋</div>
                <div className="stat-body">
                  <div className="stat-value">{stats.totalOrders}</div>
                  <div className="stat-label">Total Orders</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#FFE0E0' }}>⏳</div>
                <div className="stat-body">
                  <div className="stat-value" style={{ color: 'var(--red)' }}>{stats.pendingOrders}</div>
                  <div className="stat-label">Received</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#D1ECF1' }}>📦</div>
                <div className="stat-body">
                  <div className="stat-value" style={{ color: 'var(--teal)' }}>{stats.todayOrders}</div>
                  <div className="stat-label">Orders Today</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#D4EDDA' }}>💰</div>
                <div className="stat-body">
                  <div className="stat-value" style={{ color: 'var(--success)' }}>{fmt(stats.todayRevenue)}</div>
                  <div className="stat-label">Today's Revenue</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#E8D5F5' }}>💎</div>
                <div className="stat-body">
                  <div className="stat-value">{fmt(stats.totalRevenue)}</div>
                  <div className="stat-label">Total Revenue</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#FFF3CD' }}>🍳</div>
                <div className="stat-body">
                  <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats.preparingOrders}</div>
                  <div className="stat-label">In Kitchen</div>
                </div>
              </div>
            </div>

            {/* Extra info row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
              {/* Daily Order Cap */}
              <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>📊 Daily Order Cap</span>
                  <span style={{ fontWeight: 900, fontSize: 18, color: todayCount >= 25 ? 'var(--red)' : 'var(--dark)' }}>
                    {todayCount}/{orderCap}
                  </span>
                </div>
                <div style={{ background: '#F0F0F0', borderRadius: 6, height: 10, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${capPct}%`,
                    background: todayCount >= 25 ? 'var(--red)' : '#28a745',
                    borderRadius: 6,
                    transition: 'width 0.4s',
                  }} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-light)' }}>
                  {orderCap - todayCount} slots remaining today
                </div>
              </div>

              {/* Time Slots */}
              <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>🕐 Time Slots Today</span>
                  <Link to="/admin/slots" className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>Manage →</Link>
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--teal)' }}>
                  {stats.slotsToday?.available ?? 0}
                  <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-light)' }}>
                    /{stats.slotsToday?.total ?? 0} available
                  </span>
                </div>
              </div>

              {/* Today's Special */}
              <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>⭐ Today's Special</span>
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} onClick={openSpecialModal}>
                    Change →
                  </button>
                </div>
                {stats.todaySpecial ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 28 }}>{stats.todaySpecial.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>{stats.todaySpecial.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--red)', fontWeight: 700 }}>₹{stats.todaySpecial.price}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--text-light)' }}>No special set — click Change to set one</div>
                )}
              </div>
            </div>

            <div className="recent-orders-section">
              <div className="section-header">
                <h2>Recent Orders</h2>
                <Link to="/admin/orders" className="btn btn-outline btn-sm">View All →</Link>
              </div>

              {stats.recentOrders.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">📋</div><h3>No orders yet</h3></div>
              ) : (
                <div className="card">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map(order => (
                        <tr key={order.id}>
                          <td><strong>#{String(order.id).padStart(4, '0')}</strong></td>
                          <td>
                            <div>{order.customer_name}</div>
                            <div className="cell-sub">{order.customer_phone}</div>
                          </td>
                          <td>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                          <td><strong>₹{order.total}</strong></td>
                          <td><span className={`badge ${STATUS_BADGE[order.status] || 'badge-pending'}`}>{order.status}</span></td>
                          <td className="cell-sub">{new Date(order.created_at + 'Z').toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="empty-state"><div className="empty-icon">😕</div><h3>Failed to load stats</h3></div>
        )}

        {/* Today's Special picker modal */}
        {showSpecialModal && (
          <div className="modal-overlay" onClick={() => setShowSpecialModal(false)}>
            <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Set Today's Special</h2>
                <button className="modal-close" onClick={() => setShowSpecialModal(false)}>✕</button>
              </div>
              <div className="form-group">
                <label>Pick a menu item</label>
                <select className="form-control" value={selectedSpecialId}
                  onChange={e => setSelectedSpecialId(e.target.value)}>
                  <option value="">— Select —</option>
                  {menuItems.map(m => (
                    <option key={m.id} value={m.id}>{m.emoji} {m.name} — ₹{m.price}</option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowSpecialModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveSpecial} disabled={!selectedSpecialId || savingSpecial}>
                  {savingSpecial ? 'Saving...' : 'Set as Special'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
