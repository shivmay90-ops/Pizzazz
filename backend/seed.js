const bcrypt = require('bcryptjs');
const db = require('./database');

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
  const menuItems = [
    // Pizzas
    { name: 'Margherita', description: 'Classic tomato base, fresh mozzarella, basil', price: 299, category: 'Pizza', emoji: '🍕' },
    { name: 'Pepperoni', description: 'Loaded with spicy pepperoni on rich tomato sauce', price: 399, category: 'Pizza', emoji: '🍕' },
    { name: 'BBQ Chicken', description: 'Smoky BBQ sauce, grilled chicken, caramelised onions', price: 449, category: 'Pizza', emoji: '🍕' },
    { name: 'Goa Special', description: 'Prawns, fish tikka, kokum sauce, Goan spices', price: 549, category: 'Pizza', emoji: '🍕' },
    { name: 'Paneer Tikka', description: 'Tandoori paneer, bell peppers, mint chutney drizzle', price: 399, category: 'Pizza', emoji: '🍕' },
    { name: 'Veg Supreme', description: 'Mushrooms, olives, corn, onions, capsicum', price: 349, category: 'Pizza', emoji: '🍕' },
    { name: 'Meat Lovers', description: 'Pepperoni, chicken, sausage, bacon bits', price: 499, category: 'Pizza', emoji: '🍕' },
    { name: 'Four Cheese', description: 'Mozzarella, cheddar, parmesan, gouda blend', price: 449, category: 'Pizza', emoji: '🍕' },
    { name: 'Peri Peri Chicken', description: 'Fiery peri peri chicken, red onions, jalapenos', price: 429, category: 'Pizza', emoji: '🍕' },
    { name: 'Mushroom Truffle', description: 'Wild mushrooms, truffle oil, parmesan, arugula', price: 479, category: 'Pizza', emoji: '🍕' },

    // Sides
    { name: 'Garlic Bread', description: 'Toasted baguette with garlic butter and herbs', price: 149, category: 'Sides', emoji: '🥖' },
    { name: 'Cheesy Garlic Bread', description: 'Garlic bread loaded with melted mozzarella', price: 179, category: 'Sides', emoji: '🥖' },
    { name: 'Chicken Wings', description: '6 crispy wings with dipping sauce', price: 249, category: 'Sides', emoji: '🍗' },
    { name: 'Loaded Fries', description: 'Crispy fries with cheese sauce and jalapeños', price: 159, category: 'Sides', emoji: '🍟' },
    { name: 'Caesar Salad', description: 'Romaine, croutons, parmesan, Caesar dressing', price: 199, category: 'Sides', emoji: '🥗' },

    // Drinks
    { name: 'Coca-Cola', description: 'Chilled 330ml can', price: 69, category: 'Drinks', emoji: '🥤' },
    { name: 'Fresh Lime Soda', description: 'Freshly squeezed lime with soda water', price: 89, category: 'Drinks', emoji: '🍋' },
    { name: 'Mango Lassi', description: 'Fresh mango blended with creamy yoghurt', price: 119, category: 'Drinks', emoji: '🥭' },
    { name: 'Masala Chai', description: 'Spiced Indian tea with milk', price: 79, category: 'Drinks', emoji: '🍵' },
    { name: 'Mineral Water', description: 'Chilled 500ml bottle', price: 39, category: 'Drinks', emoji: '💧' },

    // Desserts
    { name: 'Choco Lava Cake', description: 'Warm chocolate cake with molten centre', price: 149, category: 'Desserts', emoji: '🍫' },
    { name: 'Vanilla Ice Cream', description: '2 scoops of creamy vanilla', price: 99, category: 'Desserts', emoji: '🍨' },
    { name: 'Gulab Jamun', description: 'Classic Indian dessert, 3 pieces with syrup', price: 89, category: 'Desserts', emoji: '🍮' },
  ];

  const stmt = db.prepare(
    'INSERT INTO menu_items (name, description, price, category, emoji, available) VALUES (?, ?, ?, ?, ?, 1)'
  );
  for (const item of menuItems) {
    stmt.run(item.name, item.description, item.price, item.category, item.emoji);
  }
  console.log(`✅ Seeded ${menuItems.length} menu items`);
} else {
  console.log(`ℹ️  Menu items already exist (${existingItems.count} items)`);
}

console.log('✅ Seeding complete!');
console.log('\n📋 Admin credentials:');
console.log('   Username: admin');
console.log('   Password: pizzazz2024');
