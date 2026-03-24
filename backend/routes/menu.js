const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('../database');
const { authenticateAdmin } = require('../middleware/auth');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `menu-${req.params.id}-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// Public: today's special item
router.get('/special', (req, res) => {
  try {
    const item = db.prepare("SELECT * FROM menu_items WHERE is_special = 1 AND available = 1 LIMIT 1").get();
    if (!item) return res.status(404).json({ error: 'No special item set' });
    res.json(item);
  } catch (e) {
    res.status(404).json({ error: 'No special item set' });
  }
});

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
  const result = db.prepare(
    'INSERT INTO menu_items (name, description, price, category, emoji, available) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name, description || '', price, category, emoji || '🍕', available !== false ? 1 : 0);
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(item);
});

// Admin: upload image for a menu item
router.post('/:id/image', authenticateAdmin, upload.single('image'), (req, res) => {
  const existing = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Item not found' });

  // Delete old image file if it exists
  if (existing.image_url) {
    const oldPath = path.join(__dirname, '..', existing.image_url.replace(/^\//, ''));
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  const image_url = `/uploads/${req.file.filename}`;
  db.prepare('UPDATE menu_items SET image_url = ? WHERE id = ?').run(image_url, req.params.id);
  const updated = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// Admin: remove image for a menu item
router.delete('/:id/image', authenticateAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Item not found' });
  if (existing.image_url) {
    const imgPath = path.join(__dirname, '..', existing.image_url.replace(/^\//, ''));
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }
  db.prepare('UPDATE menu_items SET image_url = NULL WHERE id = ?').run(req.params.id);
  res.json({ message: 'Image removed' });
});

// Admin: toggle today's special (only one item can be special at a time)
router.put('/:id/special', authenticateAdmin, (req, res) => {
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  // Unset all, then set this one
  db.prepare('UPDATE menu_items SET is_special = 0').run();
  db.prepare('UPDATE menu_items SET is_special = 1 WHERE id = ?').run(req.params.id);

  const updated = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  res.json(updated);
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
