const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'pizzazz.db'));

// Enable WAL mode for better performance
db.exec('PRAGMA journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    emoji TEXT DEFAULT '🍕',
    available INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    items TEXT NOT NULL,
    subtotal REAL NOT NULL,
    delivery_fee REAL NOT NULL DEFAULT 50,
    total REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'Received',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS time_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slot_date TEXT NOT NULL,
    slot_time TEXT NOT NULL,
    is_booked INTEGER DEFAULT 0,
    order_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(slot_date, slot_time)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Add new columns to existing tables (idempotent — ignore errors if column exists)
const alterStatements = [
  "ALTER TABLE orders ADD COLUMN order_source TEXT DEFAULT 'Website'",
  "ALTER TABLE orders ADD COLUMN is_heart_shape INTEGER DEFAULT 0",
  "ALTER TABLE orders ADD COLUMN time_slot TEXT",
  "ALTER TABLE orders ADD COLUMN order_type TEXT DEFAULT 'Standard'",
  "ALTER TABLE menu_items ADD COLUMN is_special INTEGER DEFAULT 0",
  "ALTER TABLE menu_items ADD COLUMN image_url TEXT",
];

for (const stmt of alterStatements) {
  try { db.exec(stmt); } catch (e) { /* column already exists */ }
}

module.exports = db;
