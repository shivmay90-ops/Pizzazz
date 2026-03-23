import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { itemCount, setIsOpen } = useCart();
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-inner page-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-emoji">🍕</span>
          <div>
            <span className="logo-name">Pizzazz</span>
            <span className="logo-location">Goa</span>
          </div>
        </Link>

        <div className="navbar-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/menu" className={`nav-link ${location.pathname === '/menu' ? 'active' : ''}`}>Menu</Link>
        </div>

        <div className="navbar-right">
          <button className="cart-btn" onClick={() => setIsOpen(true)}>
            🛒 Cart
            {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
          </button>
        </div>
      </div>
    </nav>
  );
}
