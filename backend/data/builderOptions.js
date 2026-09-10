const sauces = [
  { id: 'marinara', name: 'Marinara' },
  { id: 'makhani', name: 'Makhani' },
  { id: 'bianca', name: 'Bianca (No Sauce)' },
];

const veggies = [
  { id: 'lachha-pyaz', name: 'Lachha Pyaz' },
  { id: 'onion', name: 'Onion' },
  { id: 'bell-peppers', name: 'Bell Peppers' },
  { id: 'tomatoes', name: 'Tomatoes' },
  { id: 'fresh-jalapenos', name: 'Fresh Jalapeños' },
  { id: 'pickled-jalapenos', name: 'Pickled Jalapeños' },
  { id: 'pickled-red-paprika', name: 'Pickled Red Paprika' },
  { id: 'brined-olives', name: 'Brined Olives' },
  { id: 'sweet-corn', name: 'Sweet Corn' },
];

const proteins = [
  { id: 'paneer-tandoori', name: 'Paneer Tandoori', is_veg: true },
  { id: 'paneer-indie-spice', name: 'Paneer with Indie Spice', is_veg: true },
  { id: 'spicy-paneer-cubes', name: 'Spicy Paneer Cubes', is_veg: true },
  { id: 'sauteed-mushrooms', name: 'Sautéed Mushrooms', is_veg: true },
  { id: 'cafreal-mushroom', name: 'Cafreal Mushroom', is_veg: true },
  { id: 'chicken-tandoori', name: 'Chicken Tandoori', is_veg: false },
  { id: 'roast-chicken', name: 'Roast Chicken', is_veg: false },
  { id: 'chicken-cafreal', name: 'Chicken Cafreal', is_veg: false },
  { id: 'chilli-chicken', name: 'Chilli Chicken', is_veg: false },
];

const extras = [
  { id: 'extra-cheese', name: 'Cheese', price: 60 },
  { id: 'extra-chicken', name: 'Chicken', price: 60 },
  { id: 'extra-paneer', name: 'Paneer', price: 60 },
  { id: 'extra-mushrooms', name: 'Mushrooms', price: 40 },
  { id: 'extra-veggies', name: 'Veggies', price: 40 },
];

const tiers = [
  { id: 'tier-3v-1p', label: '3 Veggies + 1 Protein', veggieLimit: 3, proteinLimit: 1, priceVeg: 450, priceNonVeg: 470 },
  { id: 'tier-5v-1p', label: '5 Veggies + 1 Protein', veggieLimit: 5, proteinLimit: 1, priceVeg: 500, priceNonVeg: 530 },
  { id: 'tier-uv-2p', label: 'Unlimited Veggies + 2 Proteins', veggieLimit: null, proteinLimit: 2, priceVeg: 600, priceNonVeg: 650 },
  { id: 'tier-unlimited', label: 'Unlimited Anything', veggieLimit: null, proteinLimit: null, priceVeg: 900, priceNonVeg: 1000 },
];

module.exports = { sauces, veggies, proteins, extras, tiers };
