const bcrypt = require('bcryptjs');
const db = require('./database');
const menuItems = require('./data/menuItems');

function seed() {
  console.log('🌱 Seeding database...');

  // Seed admin
  const existingAdmin = db.prepare('SELECT * FROM admins WHERE username = ?').get('admin');
  if (!existingAdmin) {
    const hash = bcrypt.hashSync('pizzazz2024', 10);
    db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('admin', hash);
    console.log('✅ Admin created: username=admin, password=pizzazz2024');
  } else {
    console.log('ℹ️  Admin already exists');
  }

  // Seed menu items
  const existingItems = db.prepare('SELECT COUNT(*) as count FROM menu_items').get();
  if (existingItems.count === 0) {
    const stmt = db.prepare(
      'INSERT INTO menu_items (name, description, price, category, emoji, available, is_veg, sizes) VALUES (?, ?, ?, ?, ?, 1, ?, ?)'
    );
    for (const item of menuItems) {
      const sizesJson = item.sizes ? JSON.stringify(item.sizes) : null;
      const price = item.sizes ? Math.min(...Object.values(item.sizes)) : item.price;
      stmt.run(item.name, item.description, price, item.category, item.emoji, item.is_veg ? 1 : 0, sizesJson);
    }
    console.log(`✅ Seeded ${menuItems.length} menu items`);
  } else {
    console.log(`ℹ️  Menu items already exist (${existingItems.count} items)`);
  }

  console.log('✅ Seeding complete!');
}

if (require.main === module) {
  seed();
  console.log('\n📋 Admin credentials:');
  console.log('   Username: admin');
  console.log('   Password: pizzazz2024');
}

module.exports = seed;
