const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const ticketRoutes = require('./routes/tickets');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/tickets', ticketRoutes);

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
