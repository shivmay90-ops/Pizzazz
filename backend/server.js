const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { DATA_DIR } = require('./dataDir');
const seed = require('./seed');

seed();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(DATA_DIR, 'uploads')));

// Routes
app.use('/api/admin', require('./routes/admin'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/slots', require('./routes/slots'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', name: 'Pizzazz API' }));

// Serve the built frontend, when present (production)
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(path.join(frontendDist, 'index.html'))) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🍕 Pizzazz API running on http://localhost:${PORT}`);
});
