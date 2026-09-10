module.exports = [
  // Pizzas — Veg
  { name: 'Pizza Margherita', description: 'Classic tomato base with fresh mozzarella', category: 'Pizza', emoji: '🍕', is_veg: 1, sizes: { '9"': 300, '12"': 400 } },
  { name: 'Paneer Tandoori Tikka', description: 'Tandoori-spiced paneer tikka, onions & peppers', category: 'Pizza', emoji: '🍕', is_veg: 1, sizes: { '9"': 330, '12"': 440 } },
  { name: 'Veg Chilli', description: 'Spicy chilli veggies with a tangy kick', category: 'Pizza', emoji: '🍕', is_veg: 1, sizes: { '9"': 330, '12"': 440 } },
  { name: 'Veg Cafreal', description: 'Goan cafreal-spiced vegetables', category: 'Pizza', emoji: '🍕', is_veg: 1, sizes: { '9"': 330, '12"': 440 } },

  // Pizzas — Non-Veg
  { name: 'Roast Chicken', description: 'Slow-roasted chicken, classic and smoky', category: 'Pizza', emoji: '🍕', is_veg: 0, sizes: { '9"': 350, '12"': 460 } },
  { name: 'Chicken Tandoori Tikka', description: 'Tandoori-spiced chicken tikka', category: 'Pizza', emoji: '🍕', is_veg: 0, sizes: { '9"': 350, '12"': 460 } },
  { name: 'Chilli Chicken', description: 'Spicy chilli chicken, Indo-Chinese style', category: 'Pizza', emoji: '🍕', is_veg: 0, sizes: { '9"': 350, '12"': 460 } },
  { name: 'Chicken Cafreal', description: 'Goan cafreal-spiced chicken', category: 'Pizza', emoji: '🍕', is_veg: 0, sizes: { '9"': 350, '12"': 460 } },

  // Calzones
  { name: 'Veg Calzone', description: 'Folded pizza stuffed with veggies & cheese', category: 'Calzones', emoji: '🥟', is_veg: 1, sizes: { Small: 330, Big: 440 } },
  { name: 'Non-Veg Calzone', description: 'Folded pizza stuffed with chicken & cheese', category: 'Calzones', emoji: '🥟', is_veg: 0, sizes: { Small: 350, Big: 460 } },

  // Focaccia
  { name: 'Focaccia', description: 'Oven-baked Italian flatbread with herbs', category: 'Focaccia', emoji: '🫓', is_veg: 1, price: 300 },
];
