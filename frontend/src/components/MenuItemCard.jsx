import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import './MenuItemCard.css';

export default function MenuItemCard({ item }) {
  const { addItem, items } = useCart();
  const [adding, setAdding] = useState(false);
  const cartItem = items.find(i => i.id === item.id);

  const handleAdd = () => {
    addItem(item);
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
        <div className="menu-card-name">{item.name}</div>
        <div className="menu-card-desc">{item.description}</div>
        <div className="menu-card-footer">
          <span className="menu-card-price">₹{item.price}</span>
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
