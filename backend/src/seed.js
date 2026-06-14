const db = require('./database');
const path = require('path');
const fs = require('fs');

const seedPath = path.join(__dirname, '..', 'data', 'seed-data.json');
const raw = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

// Support both old format (array) and new format ({ tickets, users })
const tickets = Array.isArray(raw) ? raw : (raw.tickets || []);
const users = Array.isArray(raw) ? [] : (raw.users || []);

// Seed tickets
const insertTicketWithTimestamps = db.prepare(`
  INSERT INTO tickets (title, description, priority, status, customer_name, customer_email, created_at, updated_at)
  VALUES (@title, @description, @priority, @status, @customer_name, @customer_email, @created_at, @updated_at)
`);

const insertTicketWithoutTimestamps = db.prepare(`
  INSERT INTO tickets (title, description, priority, status, customer_name, customer_email)
  VALUES (@title, @description, @priority, @status, @customer_name, @customer_email)
`);

// Seed users (with pre-hashed passwords)
const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (email, password_hash, created_at)
  VALUES (@email, @password_hash, @created_at)
`);

const seedAll = db.transaction(() => {
  db.exec('DELETE FROM tickets');
  db.exec("DELETE FROM sqlite_sequence WHERE name = 'tickets'");

  for (const ticket of tickets) {
    if (ticket.created_at) {
      insertTicketWithTimestamps.run(ticket);
    } else {
      insertTicketWithoutTimestamps.run(ticket);
    }
  }

  db.exec('DELETE FROM users');
  db.exec("DELETE FROM sqlite_sequence WHERE name = 'users'");

  for (const user of users) {
    insertUser.run(user);
  }
});

seedAll();
console.log(`Seeded ${tickets.length} tickets and ${users.length} users successfully.`);
