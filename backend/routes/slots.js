const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateAdmin } = require('../middleware/auth');

const todayStr = () => new Date().toISOString().split('T')[0];

// Public: today's slots with availability
router.get('/today', (req, res) => {
  const slots = db.prepare("SELECT * FROM time_slots WHERE slot_date = ? ORDER BY slot_time").all(todayStr());
  res.json(slots);
});

// Admin: get all slots for a date (with customer name if booked)
router.get('/', authenticateAdmin, (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date query param required (YYYY-MM-DD)' });
  const slots = db.prepare(
    `SELECT ts.*, o.customer_name
     FROM time_slots ts
     LEFT JOIN orders o ON ts.order_id = o.id
     WHERE ts.slot_date = ?
     ORDER BY ts.slot_time`
  ).all(date);
  res.json(slots);
});

// Admin: create a single slot
router.post('/', authenticateAdmin, (req, res) => {
  const { slot_date, slot_time } = req.body;
  if (!slot_date || !slot_time) {
    return res.status(400).json({ error: 'slot_date and slot_time are required' });
  }
  try {
    const result = db.prepare("INSERT INTO time_slots (slot_date, slot_time) VALUES (?, ?)").run(slot_date, slot_time.trim());
    const slot = db.prepare("SELECT * FROM time_slots WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(slot);
  } catch (e) {
    if (e.message && e.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Slot already exists for that date and time' });
    }
    res.status(500).json({ error: e.message });
  }
});

// Admin: bulk create slots from an array of times for a given date
router.post('/bulk', authenticateAdmin, (req, res) => {
  const { slot_date, times } = req.body;
  if (!slot_date || !Array.isArray(times) || times.length === 0) {
    return res.status(400).json({ error: 'slot_date and times array are required' });
  }
  const created = [];
  const errors = [];
  for (const t of times) {
    const time = t.trim();
    if (!time) continue;
    try {
      const result = db.prepare("INSERT INTO time_slots (slot_date, slot_time) VALUES (?, ?)").run(slot_date, time);
      created.push(db.prepare("SELECT * FROM time_slots WHERE id = ?").get(result.lastInsertRowid));
    } catch (e) {
      errors.push({ time, error: e.message && e.message.includes('UNIQUE') ? 'already exists' : e.message });
    }
  }
  res.status(201).json({ created, errors });
});

// Admin: delete a slot (only if not booked)
router.delete('/:id', authenticateAdmin, (req, res) => {
  const slot = db.prepare("SELECT * FROM time_slots WHERE id = ?").get(req.params.id);
  if (!slot) return res.status(404).json({ error: 'Slot not found' });
  if (slot.is_booked) return res.status(400).json({ error: 'Cannot delete a booked slot' });
  db.prepare("DELETE FROM time_slots WHERE id = ?").run(req.params.id);
  res.json({ message: 'Slot deleted' });
});

module.exports = router;
