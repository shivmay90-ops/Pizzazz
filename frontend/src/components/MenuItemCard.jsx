import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import './MenuItemCard.css';

export default function MenuItemCard({ item }) {
  const { addItem, items } = useCart();
  const [adding, setAdding] = useState(false);

  let sizes = null;
  try { sizes = item.sizes ? JSON.parse(item.sizes) : null; } catch { sizes = null; }
  const sizeLabels = sizes ? Object.keys(sizes) : null;
  const [selectedSize, setSelectedSize] = useState(sizeLabels ? sizeLabels[0] : null);

  const price = sizes ? sizes[selectedSize] : item.price;
  const cartId = sizes ? `${item.id}-${selectedSize}` : `${item.id}`;
  const cartItem = items.find(i => i.cartId === cartId);

  const handleAdd = () => {
    addItem({
      cartId,
      id: item.id,
      name: sizes ? `${item.name} (${selectedSize})` : item.name,
      price,
      size: sizes ? selectedSize : undefined,
      emoji: item.emoji,
      image_url: item.image_url,
    });
    setAdding(true);
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <div className="menu-card">
      {item.image_url
        ? <img className="menu-card-img" src={item.image_url} alt={item.name} />
        : <div className="menu-card-emoji">{item.emoji}</div>
      }
      <div className="menu-card-body">
        <div className="menu-card-name">
          <span className={`veg-dot ${item.is_veg ? 'veg' : 'non-veg'}`} title={item.is_veg ? 'Veg' : 'Non-Veg'} />
          {item.name}
        </div>
        <div className="menu-card-desc">{item.description}</div>

        {sizeLabels && (
          <div className="menu-card-sizes">
            {sizeLabels.map(label => (
              <button
                key={label}
                type="button"
                className={`size-pill ${selectedSize === label ? 'active' : ''}`}
                onClick={() => setSelectedSize(label)}
              >
                {label} · ₹{sizes[label]}
              </button>
            ))}
          </div>
        )}

        <div className="menu-card-footer">
          <span className="menu-card-price">₹{price}</span>
          <button
            className={`btn btn-primary btn-sm add-btn ${adding ? 'adding' : ''}`}
            onClick={handleAdd}
          >
            {adding ? '✓ Added!' : cartItem ? `+Add (${cartItem.quantity})` : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
