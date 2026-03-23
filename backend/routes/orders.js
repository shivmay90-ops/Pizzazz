const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateAdmin } = require('../middleware/auth');

// Public: place an order
router.post('/', (req, res) => {
  const { customer_name, customer_phone, customer_address, items, notes } = req.body;

  if (!customer_name || !customer_phone || !customer_address || !items || items.length === 0) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate items and calculate total
  let subtotal = 0;
  const validatedItems = [];

  for (const item of items) {
    const menuItem = db.prepare('SELECT * FROM menu_items WHERE id = ? AND available = 1').get(item.id);
    if (!menuItem) {
      return res.status(400).json({ error: `Menu item not found: ${item.id}` });
    }
    const quantity = parseInt(item.quantity) || 1;
    subtotal += menuItem.price * quantity;
    validatedItems.push({
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity,
      emoji: menuItem.emoji
    });
  }

  const delivery_fee = 50;
  const total = subtotal + delivery_fee;

  const stmt = db.prepare(
    'INSERT INTO orders (customer_name, customer_phone, customer_address, items, subtotal, delivery_fee, total, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(
    customer_name,
    customer_phone,
    customer_address,
    JSON.stringify(validatedItems),
    subtotal,
    delivery_fee,
    total,
    'Pending',
    notes || ''
  );

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ ...order, items: JSON.parse(order.items) });
});

// Admin: get all orders
router.get('/', authenticateAdmin, (req, res) => {
  const { status } = req.query;
  let query = 'SELECT * FROM orders ORDER BY created_at DESC';
  let orders;
  if (status && status !== 'all') {
    orders = db.prepare('SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC').all(status);
  } else {
    orders = db.prepare(query).all();
  }
  res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items) })));
});

// Admin: get single order
router.get('/:id', authenticateAdmin, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({ ...order, items: JSON.parse(order.items) });
});

// Admin: update order status
router.put('/:id', authenticateAdmin, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  res.json({ ...updated, items: JSON.parse(updated.items) });
});

// Admin: dashboard stats
router.get('/stats/summary', authenticateAdmin, (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get();
  const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Pending'").get();
  const preparingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Preparing'").get();
  const todayOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE date(created_at) = ?").get(today);
  const todayRevenue = db.prepare("SELECT SUM(total) as revenue FROM orders WHERE date(created_at) = ? AND status != 'Cancelled'").get(today);
  const totalRevenue = db.prepare("SELECT SUM(total) as revenue FROM orders WHERE status != 'Cancelled'").get();
  const recentOrders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5').all();

  res.json({
    totalOrders: totalOrders.count,
    pendingOrders: pendingOrders.count,
    preparingOrders: preparingOrders.count,
    todayOrders: todayOrders.count,
    todayRevenue: todayRevenue.revenue || 0,
    totalRevenue: totalRevenue.revenue || 0,
    recentOrders: recentOrders.map(o => ({ ...o, items: JSON.parse(o.items) }))
  });
});

module.exports = router;
