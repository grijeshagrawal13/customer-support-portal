const fs = require('fs');
const path = require('path');

const LIVE_URL = process.env.RENDER_EXTERNAL_URL
  || process.env.LIVE_APP_URL
  || 'https://customer-support-portal-vtbt.onrender.com';

const EXPORT_ENDPOINT = `${LIVE_URL}/api/tickets/export`;
const SEED_PATH = path.join(__dirname, '..', 'data', 'seed-data.json');

async function exportSeed() {
  console.log(`Fetching tickets from ${EXPORT_ENDPOINT}...`);

  try {
    const res = await fetch(EXPORT_ENDPOINT, { signal: AbortSignal.timeout(15000) });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const tickets = await res.json();

    if (!Array.isArray(tickets) || tickets.length === 0) {
      console.log('No tickets returned from live app. Keeping existing seed-data.json.');
      return;
    }

    fs.writeFileSync(SEED_PATH, JSON.stringify(tickets, null, 2) + '\n');
    console.log(`Exported ${tickets.length} tickets to seed-data.json`);
  } catch (err) {
    console.log(`Could not reach live app (${err.message}). Keeping existing seed-data.json.`);
  }
}

exportSeed();
