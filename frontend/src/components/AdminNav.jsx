import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './AdminNav.css';

export default function AdminNav() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin');
  };

  const user = localStorage.getItem('admin_user') || 'Admin';

  return (
    <aside className="admin-nav">
      <div className="admin-nav-logo">
        <span className="admin-logo-icon">🍕</span>
        <div>
          <div className="admin-logo-name">Pizzazz</div>
          <div className="admin-logo-sub">Admin Panel</div>
        </div>
      </div>

      <nav className="admin-nav-links">
        <NavLink to="/admin/dashboard" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
          <span>📊</span> Dashboard
        </NavLink>
        <NavLink to="/admin/orders" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
          <span>📋</span> Orders
        </NavLink>
        <NavLink to="/admin/menu" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
          <span>🍕</span> Menu
        </NavLink>
      </nav>

      <div className="admin-nav-footer">
        <div className="admin-user">
          <div className="admin-user-avatar">{user[0].toUpperCase()}</div>
          <span>{user}</span>
        </div>
        <button className="admin-logout-btn" onClick={handleLogout}>
          Logout →
        </button>
      </div>
    </aside>
  );
}
