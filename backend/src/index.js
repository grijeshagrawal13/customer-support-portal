require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const ticketRoutes = require('./routes/tickets');
const authRoutes = require('./routes/auth');
const authenticate = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

// Public export endpoint (needed for seed backup during build)
app.get('/api/tickets/export', (req, res) => {
  const tickets = db.prepare(
    'SELECT title, description, priority, status, customer_name, customer_email, created_at, updated_at FROM tickets ORDER BY created_at DESC'
  ).all();
  const users = db.prepare(
    'SELECT email, password_hash, created_at FROM users ORDER BY id ASC'
  ).all();
  res.json({ tickets, users });
});

app.use('/api/tickets', authenticate, ticketRoutes);

if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Auto-seed if database is empty (first deploy)
const count = db.prepare('SELECT COUNT(*) as count FROM tickets').get();
if (count.count === 0) {
  console.log('Empty database detected, seeding...');
  require('./seed');
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
