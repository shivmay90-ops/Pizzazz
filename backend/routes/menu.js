const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateAdmin } = require('../middleware/auth');

// Public: get all available menu items
router.get('/', (req, res) => {
  const items = db.prepare('SELECT * FROM menu_items WHERE available = 1 ORDER BY category, name').all();
  res.json(items);
});

// Admin: get all menu items (including unavailable)
router.get('/all', authenticateAdmin, (req, res) => {
  const items = db.prepare('SELECT * FROM menu_items ORDER BY category, name').all();
  res.json(items);
});

// Admin: add menu item
router.post('/', authenticateAdmin, (req, res) => {
  const { name, description, price, category, emoji, available } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'name, price, and category are required' });
  }
  const stmt = db.prepare(
    'INSERT INTO menu_items (name, description, price, category, emoji, available) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(name, description || '', price, category, emoji || '🍕', available !== false ? 1 : 0);
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(item);
});

// Admin: update menu item
router.put('/:id', authenticateAdmin, (req, res) => {
  const { name, description, price, category, emoji, available } = req.body;
  const existing = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Item not found' });

  db.prepare(
    'UPDATE menu_items SET name=?, description=?, price=?, category=?, emoji=?, available=? WHERE id=?'
  ).run(
    name ?? existing.name,
    description ?? existing.description,
    price ?? existing.price,
    category ?? existing.category,
    emoji ?? existing.emoji,
    available !== undefined ? (available ? 1 : 0) : existing.available,
    req.params.id
  );
  const updated = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// Admin: delete menu item
router.delete('/:id', authenticateAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Item not found' });
  db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
  res.json({ message: 'Item deleted' });
});

module.exports = router;
