# SupportHub — Customer Support Portal

A full-stack customer support portal where users can submit, view, and manage support tickets. Built as a rapid prototype for the DevRev Solutions Engineer assignment.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Backend | Node.js + Express |
| Database | SQLite (via better-sqlite3) |
| Deployment | Render.com (single service) |

## Features

- **Dashboard** — Overview with ticket stats by status and priority
- **Ticket List** — Filterable/searchable table of all tickets
- **Ticket Detail** — View full details, update status and priority inline
- **Create Ticket** — Form to submit new support requests
- **REST API** — Full CRUD with filtering and stats endpoint

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client Browser                     │
│  React SPA (Dashboard / List / Detail / Create)      │
└──────────────────────────┬──────────────────────────┘
                           │ HTTP (fetch)
┌──────────────────────────▼──────────────────────────┐
│                   Express Server                      │
│  /api/tickets       → CRUD routes                    │
│  /api/tickets/stats → Aggregation                    │
│  /*                 → Serves React static build      │
└──────────────────────────┬──────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────┐
│                   SQLite Database                     │
│  tickets table (id, title, description, priority,    │
│                  status, customer_name, email, ...)   │
└─────────────────────────────────────────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 18+ installed

### Local Development

```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Seed the database with sample data
cd ../backend && npm run seed

# 3. Start the backend (port 3001)
npm run dev

# 4. In another terminal, start the frontend (port 5173)
cd frontend && npm run dev
```

Open http://localhost:5173 in your browser.

### Production Build (Single Server)

```bash
# Build frontend
cd frontend && npm run build

# Start server in production mode
cd ../backend
NODE_ENV=production npm start
```

Open http://localhost:3001 — Express serves both the API and the React app.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets` | List all tickets (supports `?status=`, `?priority=`, `?search=` query params) |
| GET | `/api/tickets/stats` | Aggregated counts by status and priority |
| GET | `/api/tickets/:id` | Get a single ticket |
| POST | `/api/tickets` | Create a new ticket |
| PUT | `/api/tickets/:id` | Update a ticket |
| DELETE | `/api/tickets/:id` | Delete a ticket |

## Data Model

```sql
CREATE TABLE tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK(priority IN ('low','medium','high','critical')),
  status TEXT CHECK(status IN ('open','in_progress','resolved','closed')),
  customer_name TEXT,
  customer_email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Deployment (Render.com)

1. Push code to GitHub
2. Connect the repository on [Render](https://render.com)
3. Render will auto-detect `render.yaml` and deploy as a web service
4. Build command: `npm run render-build` (installs deps, builds frontend, seeds DB)
5. Start command: `npm start`

## How AI/CRM Systems Could Use This Data

- **AI Ticket Triage** — Automatically classify ticket priority based on description sentiment and keywords
- **Recurring Issue Detection** — NLP clustering to identify common product bugs across tickets
- **Customer Sentiment Analysis** — Track satisfaction trends over time from ticket descriptions
- **Smart Routing** — Route tickets to the right team based on content analysis
- **Auto-Summarization** — Generate daily/weekly summaries of support volume and themes for product teams

## Project Structure

```
customer-support-portal/
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── index.js          # Express server
│   │   ├── database.js       # SQLite schema + connection
│   │   ├── seed.js           # Sample data seeder
│   │   └── routes/
│   │       └── tickets.js    # CRUD API routes
│   └── data/                  # SQLite DB file (gitignored)
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── api/
│       │   └── tickets.js    # Fetch helpers
│       └── components/
│           ├── Layout.jsx
│           ├── Dashboard.jsx
│           ├── TicketList.jsx
│           ├── TicketDetail.jsx
│           └── TicketForm.jsx
├── render.yaml               # Render.com deploy config
├── package.json              # Root scripts
├── .gitignore
└── README.md
```

## Built With

- [Cursor](https://cursor.com) — AI-assisted development
- [Vite](https://vite.dev) — Frontend build tool
- [Tailwind CSS](https://tailwindcss.com) — Utility-first styling
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — Fast SQLite bindings for Node.js
