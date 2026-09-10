import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const [special, setSpecial] = useState(null);
  const [slots, setSlots] = useState(null); // null = loading
  const [selectedSlot, setSelectedSlot] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/slots/today')
      .then(r => r.json())
      .then(data => setSlots(Array.isArray(data) ? data : []))
      .catch(() => setSlots([]));

    fetch('/api/menu/special')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data && data.id) setSpecial(data); })
      .catch(() => {});
  }, []);

  const availableSlots = slots ? slots.filter(s => !s.is_booked) : [];
  const hasSlots    = slots !== null && availableSlots.length > 0;
  const allBooked   = slots !== null && slots.length > 0 && availableSlots.length === 0;
  const noSlots     = slots !== null && slots.length === 0;

  const handleSlotClick = (slotTime) => {
    setSelectedSlot(prev => (prev === slotTime ? null : slotTime));
  };

  const handleOrder = () => {
    if (selectedSlot) sessionStorage.setItem('selected_slot', selectedSlot);
    navigate('/menu');
  };

  return (
    <div className="home">

      {/* ── HERO ── */}
      <section className="hero-new">
        <div className="page-container">

          {slots === null ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div className="spinner" style={{ margin: '0 auto', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
            </div>

          ) : hasSlots ? (
            /* STATE 1 — slots available */
            <div className="hero-state">
              <div className="hero-eyebrow">PIZZAZZ GOA — TAKEAWAY</div>
              <h1 className="hero-new-title">Grab a slot. We'll handle the rest.</h1>
              <p className="hero-new-sub">Pick an available time below and walk in fresh.</p>

              <div className="slot-pills">
                {slots.map(s => (
                  <button
                    key={s.id}
                    disabled={Boolean(s.is_booked)}
                    onClick={() => !s.is_booked && handleSlotClick(s.slot_time)}
                    className={`slot-pill ${
                      s.is_booked
                        ? 'pill-taken'
                        : selectedSlot === s.slot_time
                          ? 'pill-selected'
                          : 'pill-free'
                    }`}
                  >
                    {s.is_booked ? <s>{s.slot_time}</s> : s.slot_time}
                  </button>
                ))}
              </div>

              <div className="slot-legend">
                <span><span className="leg-dot leg-free" />Available</span>
                <span><span className="leg-dot leg-taken" />Taken</span>
              </div>

              <button
                className={`hero-cta-pill ${selectedSlot ? 'hero-cta-active' : 'hero-cta-idle'}`}
                onClick={selectedSlot ? handleOrder : undefined}
                style={{ cursor: selectedSlot ? 'pointer' : 'default' }}
              >
                {selectedSlot ? `Order for ${selectedSlot} →` : 'Select a slot to order'}
              </button>
            </div>

          ) : allBooked ? (
            /* STATE 2 — fully booked */
            <div className="hero-state">
              <div className="hero-eyebrow">PIZZAZZ GOA — TAKEAWAY</div>
              <h1 className="hero-new-title">We're fully booked today</h1>
              <p className="hero-new-sub">All 30 slots have been taken — we told you we were good.</p>
              <div className="hero-dark-box">
                <div className="hero-dark-emoji">🍕</div>
                <h3>Come back tomorrow!</h3>
                <p>We open slots fresh each morning. Follow us on Instagram.</p>
                <div className="hero-dark-btns">
                  <Link to="/menu" className="hero-pill-btn">Browse our menu anyway</Link>
                  <a href="https://instagram.com/pizzazz_goa" target="_blank" rel="noreferrer" className="hero-outline-btn">
                    Follow us on Instagram
                  </a>
                </div>
              </div>
            </div>

          ) : (
            /* STATE 3 — no slots yet */
            <div className="hero-state">
              <div className="hero-eyebrow">PIZZAZZ GOA — TAKEAWAY</div>
              <h1 className="hero-new-title">We're not taking orders right now</h1>
              <p className="hero-new-sub">Slots for today haven't opened yet — check back soon.</p>
              <div className="hero-dark-box">
                <div className="hero-dark-emoji">⏰</div>
                <h3>Slots open daily</h3>
                <p>Our slots go live each morning. Explore our menu or call us.</p>
                <div className="hero-dark-btns">
                  <Link to="/menu" className="hero-pill-btn">Browse our menu</Link>
                  <a href="tel:7350576417" className="hero-outline-btn">Call us to ask</a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Slot confirmation strip */}
        {selectedSlot && (
          <div className="slot-confirm-strip">
            <div className="page-container slot-confirm-inner">
              <span>Selected slot &nbsp;·&nbsp; <strong>{selectedSlot}</strong></span>
              <button className="slot-confirm-cta" onClick={handleOrder}>
                Continue to menu →
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── TAGLINE STRIP ── */}
      <div className="tagline-strip">HOT. FRESH. FULL OF PIZZAZZ.</div>

      {/* ── CALL STRIP ── */}
      <div className="call-strip">
        <div className="page-container call-strip-inner">
          <div>
            <div className="call-strip-label">Want to reserve for tomorrow?</div>
            <div className="call-strip-phone">735 057 6417</div>
          </div>
          <a href="tel:7350576417" className="btn btn-primary">Call now</a>
        </div>
      </div>

      {/* ── INFO ROW ── */}
      <div className="info-row">
        <div className="page-container info-row-inner">
          <span><span className="info-dot" />Wood-fired oven</span>
          <span><span className="info-dot" />Pickup only</span>
          <span><span className="info-dot" />Mapusa, Goa</span>
        </div>
      </div>

      {/* ── TODAY'S SPECIAL ── */}
      {special && (
        <section style={{ background: 'linear-gradient(135deg, #C0161C 0%, #8B0000 100%)', padding: '32px 0' }}>
          <div className="page-container">
            <div style={{
              display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
              background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: '24px 32px',
            }}>
              {special.image_url
                ? <img src={special.image_url} alt={special.name} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 12 }} />
                : <div style={{ fontSize: 64 }}>{special.emoji}</div>
              }
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ color: '#FFD700', fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
                  ⭐ Today's Special
                </div>
                <h2 style={{ color: 'white', fontSize: 28, fontWeight: 900, margin: '0 0 6px' }}>{special.name}</h2>
                {special.description && (
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, margin: '0 0 12px' }}>{special.description}</p>
                )}
                <div style={{ color: '#FFD700', fontSize: 24, fontWeight: 900 }}>₹{special.price}</div>
              </div>
              <Link to="/menu" className="btn btn-lg" style={{ background: 'white', color: '#C0161C', fontWeight: 800, flexShrink: 0 }}>
                Order Now →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURES ── */}
      <section className="features" id="features">
        <div className="page-container">
          <div className="features-grid">
            {[
              { icon: '🍕', title: 'Fresh Every Time', desc: 'Handcrafted pizzas made to order with the freshest ingredients' },
              { icon: '🌊', title: 'Goa Vibes', desc: "Unique Goan flavours you won't find anywhere else" },
              { icon: '🏠', title: 'Quick Pickup', desc: 'Order online and pick up your hot pizza in 20–30 minutes' },
            ].map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="categories-section">
        <div className="page-container">
          <h2 className="section-title">What are you craving?</h2>
          <p className="section-subtitle">From wood-fired classics to your own creation</p>
          <div className="categories-grid">
            {[
              { name: 'Pizza',         emoji: '🍕', desc: 'Veg & non-veg, 9" or 12"', color: '#FFE0E0', to: '/menu?category=Pizza' },
              { name: 'Calzones',      emoji: '🥟', desc: 'Small or big',             color: '#FFF3CD', to: '/menu?category=Calzones' },
              { name: 'Focaccia',      emoji: '🫓', desc: 'Herb-baked flatbread',      color: '#D1ECF1', to: '/menu?category=Focaccia' },
              { name: 'Build Your Own', emoji: '🎨', desc: 'Your rules, your pizza',  color: '#E8D5F5', to: '/build-your-own' },
            ].map(cat => (
              <Link key={cat.name} to={cat.to} className="category-card" style={{ background: cat.color }}>
                <span className="category-emoji">{cat.emoji}</span>
                <span className="category-name">{cat.name}</span>
                <span className="category-desc">{cat.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="page-container">
          <div className="cta-card">
            <div className="cta-content">
              <h2>Ready to order?</h2>
              <p>Pickup only — order online, collect fresh from our kitchen.</p>
              <Link to="/menu" className="btn btn-primary btn-lg">Browse Full Menu →</Link>
            </div>
            <div className="cta-emoji">🍕🌴🏖️</div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="page-container">
          <div className="footer-content">
            <div>
              <div className="footer-logo">🍕 Pizzazz Goa</div>
              <p>Goa's finest pizza, made with love</p>
            </div>
            <div className="footer-info">
              <p>📞 735 057 6417 · 820 893 3263</p>
              <p>📍 Mapusa, North Goa</p>
              <p>🕐 12pm–2pm & 4pm–11pm</p>
              <p>Closed 2nd & 4th Saturday + Sunday</p>
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
