import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminNav from '../../components/AdminNav';
import './Admin.css';

const STATUS_BADGE = {
  Pending: 'badge-pending',
  Preparing: 'badge-preparing',
  Ready: 'badge-ready',
  'Out for Delivery': 'badge-out',
  Delivered: 'badge-delivered',
  Cancelled: 'badge-cancelled',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    fetch('/api/orders/stats/summary', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

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
                  <div className="stat-label">Pending Orders</div>
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
                  <div className="stat-label">Preparing Now</div>
                </div>
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
                          <td className="cell-sub">{new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
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
      </main>
    </div>
  );
}
