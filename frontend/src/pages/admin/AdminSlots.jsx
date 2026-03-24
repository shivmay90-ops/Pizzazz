import React, { useState, useEffect, useCallback } from 'react';
import AdminNav from '../../components/AdminNav';
import './Admin.css';

const token = () => localStorage.getItem('admin_token');
const fmtDate = (d) => d.toISOString().split('T')[0];

export default function AdminSlots() {
  const today = fmtDate(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayCount, setTodayCount] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [newTime, setNewTime] = useState('');
  const [bulkTimes, setBulkTimes] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSlots = useCallback(() => {
    setLoading(true);
    fetch(`/api/slots?date=${selectedDate}`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(data => { setSlots(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedDate]);

  const fetchTodayCount = useCallback(() => {
    fetch('/api/orders/today', { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(data => setTodayCount(data.count || 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchSlots();
    fetchTodayCount();
  }, [fetchSlots, fetchTodayCount]);

  const addSlot = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ slot_date: selectedDate, slot_time: newTime }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add slot');
      setShowAddModal(false);
      setNewTime('');
      fetchSlots();
      showToast('Slot added!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const bulkAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    const times = bulkTimes.split(',').map(t => t.trim()).filter(Boolean);
    try {
      const res = await fetch('/api/slots/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ slot_date: selectedDate, times }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bulk add failed');
      setShowBulkModal(false);
      setBulkTimes('');
      fetchSlots();
      showToast(`Added ${data.created.length} slot(s)${data.errors.length ? `, ${data.errors.length} skipped` : ''}`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteSlot = async (id) => {
    try {
      const res = await fetch(`/api/slots/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setSlots(prev => prev.filter(s => s.id !== id));
      showToast('Slot deleted');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const copyFromYesterday = async () => {
    const yesterday = fmtDate(new Date(new Date(selectedDate).getTime() - 86400000));
    try {
      const res = await fetch(`/api/slots?date=${yesterday}`, { headers: { Authorization: `Bearer ${token()}` } });
      const yesterdaySlots = await res.json();
      if (!yesterdaySlots.length) { showToast('No slots found for yesterday', 'error'); return; }
      const times = yesterdaySlots.map(s => s.slot_time);
      const bulkRes = await fetch('/api/slots/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ slot_date: selectedDate, times }),
      });
      const data = await bulkRes.json();
      fetchSlots();
      showToast(`Copied ${data.created.length} slot(s) from yesterday`);
    } catch (err) {
      showToast('Failed to copy slots', 'error');
    }
  };

  const availableCount = slots.filter(s => !s.is_booked).length;

  return (
    <div className="admin-layout">
      <AdminNav />
      <main className="admin-main">
        {toast && (
          <div style={{
            position: 'fixed', top: 20, right: 20, zIndex: 9999,
            background: toast.type === 'error' ? '#C0161C' : '#28a745',
            color: 'white', padding: '12px 20px', borderRadius: 8,
            fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}>
            {toast.msg}
          </div>
        )}

        <div className="admin-header">
          <div>
            <h1>Time Slot Manager</h1>
            <p>Today: {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" onClick={copyFromYesterday}>📋 Copy from yesterday</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowBulkModal(true)}>⚡ Bulk Add</button>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Add Slot</button>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div className="stat-card" style={{ flex: '1 1 200px' }}>
            <div className="stat-icon" style={{ background: '#FFE0E0' }}>📋</div>
            <div className="stat-body">
              <div className="stat-value" style={{ color: todayCount >= 25 ? 'var(--red)' : 'var(--dark)' }}>
                {todayStr() === today ? todayCount : '—'}/30
              </div>
              <div className="stat-label">Orders Today</div>
            </div>
          </div>
          <div className="stat-card" style={{ flex: '1 1 200px' }}>
            <div className="stat-icon" style={{ background: '#D4EDDA' }}>🕐</div>
            <div className="stat-body">
              <div className="stat-value" style={{ color: 'var(--success)' }}>{availableCount}</div>
              <div className="stat-label">Available Slots ({slots.length} total)</div>
            </div>
          </div>
          <div style={{ flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>View date:</label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {loading ? <div className="spinner" /> : (
          slots.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🕐</div>
              <h3>No slots for this date</h3>
              <p>Add slots using the buttons above</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {slots.map(slot => (
                <div key={slot.id} style={{
                  background: slot.is_booked ? '#FFF0F0' : '#F0FFF4',
                  border: `2px solid ${slot.is_booked ? '#C0161C' : '#28a745'}`,
                  borderRadius: 10, padding: '16px 18px',
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: slot.is_booked ? 'var(--red)' : '#28a745' }}>
                    {slot.slot_time}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: slot.is_booked ? 'var(--red)' : '#28a745' }}>
                    {slot.is_booked ? '🔴 Booked' : '🟢 Available'}
                  </div>
                  {slot.is_booked && (
                    <div style={{ fontSize: 12, color: 'var(--text-light)' }}>
                      #{String(slot.order_id).padStart(4, '0')}
                      {slot.customer_name ? ` · ${slot.customer_name}` : ''}
                    </div>
                  )}
                  {!slot.is_booked && (
                    <button
                      className="btn btn-sm"
                      style={{ background: '#FFF0F0', color: 'var(--red)', border: 'none', marginTop: 4 }}
                      onClick={() => deleteSlot(slot.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* Add Slot Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add Time Slot</h2>
                <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
              </div>
              <form onSubmit={addSlot}>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" className="form-control" value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input type="time" className="form-control" value={newTime}
                    onChange={e => setNewTime(e.target.value)} required />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Adding...' : 'Add Slot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Add Modal */}
        {showBulkModal && (
          <div className="modal-overlay" onClick={() => setShowBulkModal(false)}>
            <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Bulk Add Slots</h2>
                <button className="modal-close" onClick={() => setShowBulkModal(false)}>✕</button>
              </div>
              <form onSubmit={bulkAdd}>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" className="form-control" value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Times (comma-separated)</label>
                  <input className="form-control" value={bulkTimes}
                    onChange={e => setBulkTimes(e.target.value)}
                    placeholder="12:00, 12:30, 13:00, 13:30" required />
                  <small style={{ color: 'var(--text-light)', marginTop: 4, display: 'block' }}>
                    Enter times in HH:MM format, separated by commas
                  </small>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowBulkModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Adding...' : 'Add Slots'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}
