const db = require('./database');
const path = require('path');
const fs = require('fs');

const seedPath = path.join(__dirname, '..', 'data', 'seed-data.json');
const tickets = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

const insert = db.prepare(`
  INSERT INTO tickets (title, description, priority, status, customer_name, customer_email)
  VALUES (@title, @description, @priority, @status, @customer_name, @customer_email)
`);

const insertMany = db.transaction((items) => {
  for (const item of items) {
    insert.run(item);
  }
});

db.exec('DELETE FROM tickets');
db.exec("DELETE FROM sqlite_sequence WHERE name = 'tickets'");
insertMany(tickets);

console.log(`Seeded ${tickets.length} tickets successfully.`);
