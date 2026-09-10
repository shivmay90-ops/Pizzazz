import React, { useState, useEffect } from 'react';
import AdminNav from '../../components/AdminNav';
import './Admin.css';

const CATEGORIES = ['Pizza', 'Calzones', 'Focaccia'];
const EMPTY_FORM = {
  name: '', description: '', price: '', category: 'Pizza', emoji: '🍕', available: true, is_veg: true,
  hasSizes: false, sizeLabels: ['9"', '12"'], sizePrices: ['', ''],
};

export default function AdminMenuManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filterCat, setFilterCat] = useState('all');
  const [uploadingId, setUploadingId] = useState(null);
  const token = localStorage.getItem('admin_token');

  const fetchItems = () => {
    fetch('/api/menu/all', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, []);

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    let sizes = null;
    try { sizes = item.sizes ? JSON.parse(item.sizes) : null; } catch { sizes = null; }
    setForm({
      name: item.name, description: item.description, price: String(item.price), category: item.category,
      emoji: item.emoji, available: Boolean(item.available), is_veg: Boolean(item.is_veg),
      hasSizes: Boolean(sizes),
      sizeLabels: sizes ? Object.keys(sizes) : ['9"', '12"'],
      sizePrices: sizes ? Object.values(sizes).map(String) : ['', ''],
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const sizes = form.hasSizes
        ? Object.fromEntries(form.sizeLabels.map((label, i) => [label, parseFloat(form.sizePrices[i])]).filter(([label, price]) => label && !isNaN(price)))
        : null;
      const url = editItem ? `/api/menu/${editItem.id}` : '/api/menu';
      const method = editItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name, description: form.description, category: form.category, emoji: form.emoji,
          available: form.available, is_veg: form.is_veg,
          price: form.hasSizes ? undefined : parseFloat(form.price),
          sizes,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      fetchItems();
      setShowModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await fetch(`/api/menu/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setItems(prev => prev.filter(i => i.id !== id));
    setDeleteConfirm(null);
  };

  const toggleAvailable = async (item) => {
    const res = await fetch(`/api/menu/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ available: !item.available }),
    });
    const updated = await res.json();
    setItems(prev => prev.map(i => i.id === item.id ? updated : i));
  };

  const handleImageUpload = async (item, file) => {
    setUploadingId(item.id);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`/api/menu/${item.id}/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const updated = await res.json();
      setItems(prev => prev.map(i => i.id === item.id ? updated : i));
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingId(null);
    }
  };

  const handleRemoveImage = async (item) => {
    setUploadingId(item.id);
    try {
      await fetch(`/api/menu/${item.id}/image`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, image_url: null } : i));
    } finally {
      setUploadingId(null);
    }
  };

  const filtered = filterCat === 'all' ? items : items.filter(i => i.category === filterCat);

  return (
    <div className="admin-layout">
      <AdminNav />
      <main className="admin-main">
        <div className="admin-header">
          <div>
            <h1>Menu Manager</h1>
            <p>Add, edit, or remove menu items</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Item</button>
        </div>

        <div className="filter-tabs">
          {['all', ...CATEGORIES].map(cat => (
            <button key={cat} className={`filter-tab ${filterCat === cat ? 'active' : ''}`}
              onClick={() => setFilterCat(cat)}>
              {cat === 'all' ? 'All Items' : cat}
            </button>
          ))}
        </div>

        {loading ? <div className="spinner" /> : (
          <div className="menu-admin-grid">
            {filtered.map(item => (
              <div key={item.id} className={`menu-admin-card ${!item.available ? 'unavailable' : ''}`}>
                {/* Image area */}
                <div className="menu-admin-img-wrap">
                  {item.image_url
                    ? <img src={item.image_url} alt={item.name} className="menu-admin-img" />
                    : <div className="menu-admin-emoji">{item.emoji}</div>
                  }
                  <label className="menu-img-upload-btn" title="Upload photo">
                    {uploadingId === item.id ? '...' : '📷'}
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => e.target.files[0] && handleImageUpload(item, e.target.files[0])} />
                  </label>
                  {item.image_url && (
                    <button className="menu-img-remove-btn" title="Remove photo"
                      onClick={() => handleRemoveImage(item)}>✕</button>
                  )}
                </div>
                <div className="menu-admin-body">
                  <div className="menu-admin-name">{item.name}</div>
                  <div className="menu-admin-cat">{item.category}</div>
                  <div className="menu-admin-desc">{item.description}</div>
                  <div className="menu-admin-price">{item.sizes ? `From ₹${item.price}` : `₹${item.price}`}</div>
                </div>
                <div className="menu-admin-actions">
                  <label className="toggle-label">
                    <input type="checkbox" checked={Boolean(item.available)} onChange={() => toggleAvailable(item)} />
                    <span className="toggle-text">{item.available ? 'Available' : 'Unavailable'}</span>
                  </label>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>Edit</button>
                  <button className="btn btn-sm" style={{ background: '#FFF0F0', color: 'var(--red)', border: 'none' }}
                    onClick={() => setDeleteConfirm(item)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editItem ? 'Edit Item' : 'Add Menu Item'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <form onSubmit={handleSave}>
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Name *</label>
                    <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="form-group" style={{ width: 80 }}>
                    <label>Emoji</label>
                    <input className="form-control" value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-control" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.hasSizes} onChange={e => setForm(f => ({ ...f, hasSizes: e.target.checked }))} />
                      Has multiple sizes
                    </label>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Category *</label>
                    <select className="form-control" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {form.hasSizes ? (
                  <div className="form-row">
                    {form.sizeLabels.map((label, i) => (
                      <div key={i} className="form-group" style={{ flex: 1, display: 'flex', gap: 6 }}>
                        <input className="form-control" placeholder="Size" value={label}
                          onChange={e => setForm(f => ({ ...f, sizeLabels: f.sizeLabels.map((l, idx) => idx === i ? e.target.value : l) }))} />
                        <input className="form-control" type="number" min="0" step="0.01" placeholder="₹" value={form.sizePrices[i]}
                          onChange={e => setForm(f => ({ ...f, sizePrices: f.sizePrices.map((p, idx) => idx === i ? e.target.value : p) }))} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input className="form-control" type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
                  </div>
                )}

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.available} onChange={e => setForm(f => ({ ...f, available: e.target.checked }))} />
                    Available for ordering
                  </label>
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.is_veg} onChange={e => setForm(f => ({ ...f, is_veg: e.target.checked }))} />
                    Vegetarian
                  </label>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : editItem ? 'Save Changes' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete confirm */}
        {deleteConfirm && (
          <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
              <h2 style={{ marginBottom: 12 }}>Delete Item?</h2>
              <p style={{ color: 'var(--text-light)', marginBottom: 24 }}>
                Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.
              </p>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn btn-primary" style={{ background: 'var(--red)' }} onClick={() => handleDelete(deleteConfirm.id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
