const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/admin', require('./routes/admin'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/slots', require('./routes/slots'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', name: 'Pizzazz API' }));

app.listen(PORT, () => {
  console.log(`🍕 Pizzazz API running on http://localhost:${PORT}`);
});
