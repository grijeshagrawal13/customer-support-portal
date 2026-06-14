const fs = require('fs');
const path = require('path');

const LIVE_URL = process.env.RENDER_EXTERNAL_URL
  || process.env.LIVE_APP_URL
  || 'https://customer-support-portal-vtbt.onrender.com';

const EXPORT_ENDPOINT = `${LIVE_URL}/api/tickets/export`;
const SEED_PATH = path.join(__dirname, '..', 'data', 'seed-data.json');

async function exportSeed() {
  console.log(`Fetching data from ${EXPORT_ENDPOINT}...`);

  try {
    const res = await fetch(EXPORT_ENDPOINT, { signal: AbortSignal.timeout(15000) });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();

    // Handle both old format (array of tickets) and new format ({ tickets, users })
    if (Array.isArray(data)) {
      fs.writeFileSync(SEED_PATH, JSON.stringify({ tickets: data, users: [] }, null, 2) + '\n');
      console.log(`Exported ${data.length} tickets (legacy format) to seed-data.json`);
    } else if (data.tickets) {
      fs.writeFileSync(SEED_PATH, JSON.stringify(data, null, 2) + '\n');
      console.log(`Exported ${data.tickets.length} tickets and ${data.users?.length || 0} users to seed-data.json`);
    } else {
      console.log('Unexpected response format. Keeping existing seed-data.json.');
    }
  } catch (err) {
    console.log(`Could not reach live app (${err.message}). Keeping existing seed-data.json.`);
  }
}

exportSeed();
