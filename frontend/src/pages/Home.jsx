import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const FEATURES = [
  { icon: '🍕', title: 'Fresh Every Time', desc: 'Handcrafted pizzas made to order with the freshest ingredients' },
  { icon: '🌊', title: 'Goa Vibes', desc: 'Unique Goan flavours you won\'t find anywhere else' },
  { icon: '🛵', title: 'Fast Delivery', desc: 'Hot pizza at your doorstep across all of Goa' },
];

export default function Home() {
  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content page-container">
          <div className="hero-text">
            <div className="hero-tag">🌴 Goa's Finest Pizza</div>
            <h1 className="hero-title">
              Pizza with a<br />
              <span className="hero-highlight">Goan Soul</span>
            </h1>
            <p className="hero-subtitle">
              Hand-tossed, wood-fired, loaded with love. Fresh ingredients, bold flavours,
              delivered to your doorstep across Goa.
            </p>
            <div className="hero-actions">
              <Link to="/menu" className="btn btn-primary btn-lg">Order Now 🍕</Link>
              <a href="#features" className="btn btn-ghost btn-lg">Learn More</a>
            </div>
          </div>
          <div className="hero-pizza">
            <div className="pizza-big">🍕</div>
            <div className="hero-badge">
              <span className="badge-num">23+</span>
              <span className="badge-label">Menu<br/>Items</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features" id="features">
        <div className="page-container">
          <div className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="page-container">
          <h2 className="section-title">What are you craving?</h2>
          <p className="section-subtitle">From classic Margherita to our signature Goa Special</p>
          <div className="categories-grid">
            {[
              { name: 'Pizzas', emoji: '🍕', desc: '10 varieties', color: '#FFE0E0' },
              { name: 'Sides', emoji: '🍟', desc: 'Garlic bread, wings & more', color: '#FFF3CD' },
              { name: 'Drinks', emoji: '🥤', desc: 'Fresh & refreshing', color: '#D1ECF1' },
              { name: 'Desserts', emoji: '🍨', desc: 'Sweet endings', color: '#E8D5F5' },
            ].map(cat => (
              <Link key={cat.name} to={`/menu?category=${cat.name}`} className="category-card" style={{ background: cat.color }}>
                <span className="category-emoji">{cat.emoji}</span>
                <span className="category-name">{cat.name}</span>
                <span className="category-desc">{cat.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="page-container">
          <div className="cta-card">
            <div className="cta-content">
              <h2>Ready to order?</h2>
              <p>Free delivery on all orders. Minimum order ₹299.</p>
              <Link to="/menu" className="btn btn-primary btn-lg">Browse Full Menu →</Link>
            </div>
            <div className="cta-emoji">🍕🌴🏖️</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="page-container">
          <div className="footer-content">
            <div>
              <div className="footer-logo">🍕 Pizzazz Goa</div>
              <p>Goa's finest pizza, delivered with love</p>
            </div>
            <div className="footer-info">
              <p>📞 +91 98765 43210</p>
              <p>📍 Calangute, North Goa</p>
              <p>🕐 11am – 11pm daily</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 Pizzazz Goa. All rights reserved. | <Link to="/admin">Admin Login</Link></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
