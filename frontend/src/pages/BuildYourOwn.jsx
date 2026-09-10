import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './BuildYourOwn.css';

export default function BuildYourOwn() {
  const { addItem, setIsOpen } = useCart();
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);

  const [tierId, setTierId] = useState(null);
  const [sauce, setSauce] = useState(null);
  const [veggies, setVeggies] = useState([]);
  const [proteins, setProteins] = useState([]);
  const [extras, setExtras] = useState([]);

  useEffect(() => {
    fetch('/api/menu/builder-options')
      .then(r => r.json())
      .then(data => {
        setOptions(data);
        setTierId(data.tiers[0].id);
        setSauce(data.sauces[0].id);
        setLoading(false);
      })
      .catch(() => { setError('Failed to load builder options'); setLoading(false); });
  }, []);

  const tier = useMemo(() => options?.tiers.find(t => t.id === tierId), [options, tierId]);

  useEffect(() => {
    if (!tier) return;
    if (tier.veggieLimit !== null) setVeggies(v => v.slice(0, tier.veggieLimit));
    if (tier.proteinLimit !== null) setProteins(p => p.slice(0, tier.proteinLimit));
  }, [tierId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="page-container" style={{ padding: '80px 0' }}><div className="spinner" /></div>;
  if (error || !options) return (
    <div className="page-container"><div className="empty-state"><div className="empty-icon">😕</div><h3>{error}</h3></div></div>
  );

  const toggleVeggie = (id) => {
    setVeggies(prev => {
      if (prev.includes(id)) return prev.filter(v => v !== id);
      if (tier.veggieLimit !== null && prev.length >= tier.veggieLimit) return prev;
      return [...prev, id];
    });
  };

  const toggleProtein = (id) => {
    setProteins(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id);
      if (tier.proteinLimit !== null && prev.length >= tier.proteinLimit) return prev;
      return [...prev, id];
    });
  };

  const toggleExtra = (id) => {
    setExtras(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  const selectedProteins = options.proteins.filter(p => proteins.includes(p.id));
  const selectedExtras = options.extras.filter(e => extras.includes(e.id));
  const isNonVeg = selectedProteins.some(p => !p.is_veg);
  const basePrice = isNonVeg ? tier.priceNonVeg : tier.priceVeg;
  const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
  const total = basePrice + extrasTotal;

  const handleAddToCart = () => {
    const sauceObj = options.sauces.find(s => s.id === sauce);
    const veggieObjs = options.veggies.filter(v => veggies.includes(v.id));
    const description = [
      `Tier: ${tier.label}`,
      `Sauce: ${sauceObj.name}`,
      veggieObjs.length ? `Veggies: ${veggieObjs.map(v => v.name).join(', ')}` : null,
      selectedProteins.length ? `Protein: ${selectedProteins.map(p => p.name).join(', ')}` : null,
      selectedExtras.length ? `Extras: ${selectedExtras.map(e => `+${e.name}`).join(', ')}` : null,
    ].filter(Boolean).join(' · ');

    addItem({
      cartId: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      custom: 'pizza',
      name: 'Build Your Own Pizza (12")',
      description,
      price: total,
      emoji: '🍕',
      tierId,
      sauce,
      veggies,
      proteins,
      extras,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="builder-page">
      <div className="builder-hero">
        <div className="page-container">
          <h1>Build Your Own Pizza</h1>
          <p>12" base — pick your sauce, veggies, protein & extras</p>
        </div>
      </div>

      <div className="page-container builder-content">
        <div className="builder-main">
          {/* Tier */}
          <section className="builder-section">
            <h2>1. Choose Your Combo</h2>
            <div className="tier-grid">
              {options.tiers.map(t => (
                <button key={t.id} type="button"
                  className={`tier-card ${tierId === t.id ? 'active' : ''}`}
                  onClick={() => setTierId(t.id)}>
                  <div className="tier-label">{t.label}</div>
                  <div className="tier-price">₹{t.priceVeg} veg / ₹{t.priceNonVeg} non-veg</div>
                </button>
              ))}
            </div>
          </section>

          {/* Sauce */}
          <section className="builder-section">
            <h2>2. Choose Your Sauce</h2>
            <div className="pill-grid">
              {options.sauces.map(s => (
                <button key={s.id} type="button"
                  className={`option-pill ${sauce === s.id ? 'active' : ''}`}
                  onClick={() => setSauce(s.id)}>
                  {s.name}
                </button>
              ))}
            </div>
          </section>

          {/* Veggies */}
          <section className="builder-section">
            <h2>3. Choose Your Veggies {tier.veggieLimit !== null && <span className="limit-tag">up to {tier.veggieLimit}</span>}</h2>
            <div className="pill-grid">
              {options.veggies.map(v => {
                const selected = veggies.includes(v.id);
                const atLimit = tier.veggieLimit !== null && veggies.length >= tier.veggieLimit && !selected;
                return (
                  <button key={v.id} type="button" disabled={atLimit}
                    className={`option-pill ${selected ? 'active' : ''}`}
                    onClick={() => toggleVeggie(v.id)}>
                    {v.name}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Proteins */}
          <section className="builder-section">
            <h2>4. Choose Your Protein {tier.proteinLimit !== null && <span className="limit-tag">up to {tier.proteinLimit}</span>}</h2>
            <div className="pill-grid">
              {options.proteins.map(p => {
                const selected = proteins.includes(p.id);
                const atLimit = tier.proteinLimit !== null && proteins.length >= tier.proteinLimit && !selected;
                return (
                  <button key={p.id} type="button" disabled={atLimit}
                    className={`option-pill ${selected ? 'active' : ''} ${p.is_veg ? '' : 'non-veg-pill'}`}
                    onClick={() => toggleProtein(p.id)}>
                    {p.name}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Extras */}
          <section className="builder-section">
            <h2>5. Add Extras <span className="limit-tag">optional</span></h2>
            <div className="pill-grid">
              {options.extras.map(e => (
                <button key={e.id} type="button"
                  className={`option-pill ${extras.includes(e.id) ? 'active' : ''}`}
                  onClick={() => toggleExtra(e.id)}>
                  {e.name} +₹{e.price}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Summary sidebar */}
        <div className="builder-sidebar">
          <div className="card builder-summary">
            <h3>Your Pizza</h3>
            <div className="summary-row"><span>Combo</span><span>{tier.label}</span></div>
            <div className="summary-row"><span>Type</span><span>{isNonVeg ? 'Non-Veg' : 'Veg'}</span></div>
            {selectedExtras.length > 0 && (
              <div className="summary-row"><span>Extras</span><span>{selectedExtras.map(e => e.name).join(', ')}</span></div>
            )}
            <div className="summary-total"><span>Total</span><span>₹{total}</span></div>

            <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 16 }} onClick={handleAddToCart}>
              {added ? '✓ Added to Cart!' : `Add to Cart — ₹${total}`}
            </button>

            {added && (
              <div className="builder-added-actions">
                <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setIsOpen(true)}>View Cart</button>
                <Link to="/menu" className="btn btn-ghost" style={{ width: '100%', textAlign: 'center' }}>Browse Menu</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
