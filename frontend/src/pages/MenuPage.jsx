import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MenuItemCard from '../components/MenuItemCard';
import { useCart } from '../context/CartContext';
import './MenuPage.css';

const CATEGORIES = ['All', 'Pizza', 'Calzones', 'Focaccia'];
const CATEGORY_ICON = { Pizza: '🍕', Calzones: '🥟', Focaccia: '🫓' };

export default function MenuPage() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { setIsOpen } = useCart();

  const selectedCategory = searchParams.get('category') || 'All';

  useEffect(() => {
    fetch('/api/menu')
      .then(r => r.json())
      .then(data => { setMenu(data); setLoading(false); })
      .catch(() => { setError('Failed to load menu'); setLoading(false); });
  }, []);

  const filtered = selectedCategory === 'All'
    ? menu
    : menu.filter(item => item.category === selectedCategory);

  const grouped = selectedCategory === 'All'
    ? CATEGORIES.slice(1).reduce((acc, cat) => {
        const items = menu.filter(i => i.category === cat);
        if (items.length) acc[cat] = items;
        return acc;
      }, {})
    : null;

  return (
    <div className="menu-page">
      <div className="menu-hero">
        <div className="page-container">
          <h1>Our Menu</h1>
          <p>Freshly made, every time — order your favourites</p>
        </div>
      </div>

      <div className="page-container menu-content">
        <Link to="/build-your-own" className="builder-promo">
          <div>
            <h3>🍕 Make Your Pizza, Your Rules</h3>
            <p>Pick your sauce, veggies, protein & extras — build your own 12" pizza</p>
          </div>
          <span className="builder-promo-cta">Start Building →</span>
        </Link>

        {/* Category tabs */}
        <div className="category-tabs">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`cat-tab ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSearchParams(cat === 'All' ? {} : { category: cat })}
            >
              {cat === 'All' ? '🍽️ All' : `${CATEGORY_ICON[cat]} ${cat}`}
            </button>
          ))}
        </div>

        {loading && <div className="spinner" />}
        {error && <div className="empty-state"><div className="empty-icon">😕</div><h3>{error}</h3></div>}

        {!loading && !error && (
          grouped ? (
            // Show all categories grouped
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="menu-section">
                <h2 className="menu-section-title">{CATEGORY_ICON[cat]} {cat}</h2>
                <div className="menu-grid">
                  {items.map(item => <MenuItemCard key={item.id} item={item} />)}
                </div>
              </div>
            ))
          ) : (
            <div>
              <p className="menu-count">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</p>
              <div className="menu-grid">
                {filtered.map(item => <MenuItemCard key={item.id} item={item} />)}
              </div>
            </div>
          )
        )}
      </div>

      {/* Floating cart button */}
      <button className="floating-cart-btn" onClick={() => setIsOpen(true)}>
        🛒 View Cart
      </button>
    </div>
  );
}
