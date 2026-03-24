const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateAdmin } = require('../middleware/auth');

const ORDER_CAP = 30;
const VALID_STATUSES = ['Received', 'In Kitchen', 'Ready', 'Done', 'Cancelled'];
const todayStr = () => new Date().toISOString().split('T')[0];

// Public: place an order (enforces 30/day cap)
router.post('/', (req, res) => {
  const { customer_name, customer_phone, customer_address, items, notes, time_slot, is_heart_shape, order_type } = req.body;

  if (!customer_name || !customer_phone || !items || items.length === 0) {
    return res.status(400).json({ error: 'Name, phone, and items are required' });
  }

  // Enforce daily cap
  const todayCount = db.prepare("SELECT COUNT(*) as count FROM orders WHERE date(created_at) = ?").get(todayStr());
  if (todayCount.count >= ORDER_CAP) {
    return res.status(400).json({ error: 'Sorry, we have reached our order limit for today. Please try again tomorrow or call us.' });
  }

  let subtotal = 0;
  const validatedItems = [];

  for (const item of items) {
    const menuItem = db.prepare('SELECT * FROM menu_items WHERE id = ? AND available = 1').get(item.id);
    if (!menuItem) {
      return res.status(400).json({ error: `Menu item not found: ${item.id}` });
    }
    const quantity = parseInt(item.quantity) || 1;
    subtotal += menuItem.price * quantity;
    validatedItems.push({ id: menuItem.id, name: menuItem.name, price: menuItem.price, quantity, emoji: menuItem.emoji });
  }

  const delivery_fee = 0;
  const total = subtotal;

  const result = db.prepare(
    'INSERT INTO orders (customer_name, customer_phone, customer_address, items, subtotal, delivery_fee, total, status, notes, order_source, is_heart_shape, time_slot, order_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(customer_name, customer_phone, '', JSON.stringify(validatedItems), subtotal, delivery_fee, total, 'Received', notes || '', 'Website', is_heart_shape ? 1 : 0, time_slot || null, order_type || 'Standard');

  // Mark time slot booked if provided
  // Only book slot for Website orders (Walk-in is handled via admin route)
  if (time_slot) {
    try {
      db.prepare('UPDATE time_slots SET is_booked = 1, order_id = ? WHERE slot_date = ? AND slot_time = ?').run(result.lastInsertRowid, todayStr(), time_slot);
    } catch (e) { /* slot may not exist */ }
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ ...order, items: JSON.parse(order.items) });
});

// Admin: manually create order (Swiggy/Zomato/Walk-in/Phone)
router.post('/admin', authenticateAdmin, (req, res) => {
  const { customer_name, customer_phone, customer_address, items, notes, order_source, time_slot, is_heart_shape, order_type } = req.body;

  if (!customer_name || !customer_phone || !items || items.length === 0) {
    return res.status(400).json({ error: 'customer_name, customer_phone, and items are required' });
  }

  let subtotal = 0;
  const validatedItems = [];

  for (const item of items) {
    const menuItem = db.prepare('SELECT * FROM menu_items WHERE id = ? AND available = 1').get(item.id);
    if (!menuItem) {
      return res.status(400).json({ error: `Menu item not found: ${item.id}` });
    }
    const quantity = parseInt(item.quantity) || 1;
    subtotal += menuItem.price * quantity;
    validatedItems.push({ id: menuItem.id, name: menuItem.name, price: menuItem.price, quantity, emoji: menuItem.emoji });
  }

  const delivery_fee = 0;
  const total = subtotal;

  const result = db.prepare(
    'INSERT INTO orders (customer_name, customer_phone, customer_address, items, subtotal, delivery_fee, total, status, notes, order_source, is_heart_shape, time_slot, order_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(customer_name, customer_phone, customer_address || '', JSON.stringify(validatedItems), subtotal, delivery_fee, total, 'Received', notes || '', order_source || 'Website', is_heart_shape ? 1 : 0, time_slot || null, order_type || 'Standard');

  // Only book time slot for Website and Walk-in orders
  const slotEligible = ['Website', 'Walk-in'].includes(order_source || 'Website');
  if (time_slot && slotEligible) {
    try {
      db.prepare('UPDATE time_slots SET is_booked = 1, order_id = ? WHERE slot_date = ? AND slot_time = ?').run(result.lastInsertRowid, todayStr(), time_slot);
    } catch (e) { /* slot may not exist */ }
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ ...order, items: JSON.parse(order.items) });
});

// Admin: get all orders
router.get('/', authenticateAdmin, (req, res) => {
  const { status } = req.query;
  let orders;
  if (status && status !== 'all') {
    orders = db.prepare('SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC').all(status);
  } else {
    orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  }
  res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items) })));
});

// Admin: today's orders count + list
router.get('/today', authenticateAdmin, (req, res) => {
  const today = todayStr();
  const orders = db.prepare("SELECT * FROM orders WHERE date(created_at) = ? ORDER BY created_at DESC").all(today);
  res.json({ count: orders.length, orderCap: ORDER_CAP, orders: orders.map(o => ({ ...o, items: JSON.parse(o.items) })) });
});

// Admin: dashboard stats — must come before /:id
router.get('/stats/summary', authenticateAdmin, (req, res) => {
  const today = todayStr();

  const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get();
  const receivedOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Received'").get();
  const inKitchenOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'In Kitchen'").get();
  const todayOrdersRow = db.prepare("SELECT COUNT(*) as count FROM orders WHERE date(created_at) = ?").get(today);
  const todayRevenue = db.prepare("SELECT SUM(total) as revenue FROM orders WHERE date(created_at) = ? AND status != 'Cancelled'").get(today);
  const totalRevenue = db.prepare("SELECT SUM(total) as revenue FROM orders WHERE status != 'Cancelled'").get();
  const recentOrders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5').all();

  const totalSlots = db.prepare("SELECT COUNT(*) as count FROM time_slots WHERE slot_date = ?").get(today);
  const availableSlots = db.prepare("SELECT COUNT(*) as count FROM time_slots WHERE slot_date = ? AND is_booked = 0").get(today);

  let todaySpecial = null;
  try {
    todaySpecial = db.prepare("SELECT * FROM menu_items WHERE is_special = 1 LIMIT 1").get() || null;
  } catch (e) { /* is_special column may not exist yet */ }

  res.json({
    totalOrders: totalOrders.count,
    pendingOrders: receivedOrders.count,
    preparingOrders: inKitchenOrders.count,
    todayOrders: todayOrdersRow.count,
    todayCount: todayOrdersRow.count,
    orderCap: ORDER_CAP,
    todayRevenue: todayRevenue.revenue || 0,
    totalRevenue: totalRevenue.revenue || 0,
    recentOrders: recentOrders.map(o => ({ ...o, items: JSON.parse(o.items) })),
    slotsToday: { available: availableSlots.count, total: totalSlots.count },
    todaySpecial,
  });
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
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  res.json({ ...updated, items: JSON.parse(updated.items) });
});

module.exports = router;
