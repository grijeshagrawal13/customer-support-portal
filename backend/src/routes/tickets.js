const express = require('express');
const router = express.Router();
const db = require('../database');
const OpenAI = require('openai');

// GET /api/tickets/stats — Dashboard statistics
router.get('/stats', (req, res) => {
  const byStatus = db.prepare(`
    SELECT status, COUNT(*) as count FROM tickets GROUP BY status
  `).all();

  const byPriority = db.prepare(`
    SELECT priority, COUNT(*) as count FROM tickets GROUP BY priority
  `).all();

  const total = db.prepare('SELECT COUNT(*) as count FROM tickets').get();

  res.json({ total: total.count, byStatus, byPriority });
});

// GET /api/tickets/export — Export all tickets for seed backup
router.get('/export', (req, res) => {
  const tickets = db.prepare(
    'SELECT title, description, priority, status, customer_name, customer_email FROM tickets ORDER BY id ASC'
  ).all();
  res.json(tickets);
});

// GET /api/tickets — List all tickets (with optional filters)
router.get('/', (req, res) => {
  const { status, priority, search } = req.query;

  let query = 'SELECT * FROM tickets WHERE 1=1';
  const params = {};

  if (status) {
    query += ' AND status = @status';
    params.status = status;
  }

  if (priority) {
    query += ' AND priority = @priority';
    params.priority = priority;
  }

  if (search) {
    query += ' AND (title LIKE @search OR description LIKE @search OR customer_name LIKE @search)';
    params.search = `%${search}%`;
  }

  query += ' ORDER BY created_at DESC';

  const tickets = db.prepare(query).all(params);
  res.json(tickets);
});

// GET /api/tickets/:id — Get single ticket
router.get('/:id', (req, res) => {
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  res.json(ticket);
});

// POST /api/tickets — Create a new ticket
router.post('/', (req, res) => {
  const { title, description, priority, customer_name, customer_email } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const result = db.prepare(`
    INSERT INTO tickets (title, description, priority, customer_name, customer_email)
    VALUES (@title, @description, @priority, @customer_name, @customer_email)
  `).run({
    title,
    description: description || '',
    priority: priority || 'medium',
    customer_name: customer_name || '',
    customer_email: customer_email || ''
  });

  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(ticket);
});

// PUT /api/tickets/:id — Update a ticket
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);

  if (!existing) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  const { title, description, priority, status, customer_name, customer_email } = req.body;

  db.prepare(`
    UPDATE tickets SET
      title = @title,
      description = @description,
      priority = @priority,
      status = @status,
      customer_name = @customer_name,
      customer_email = @customer_email,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `).run({
    id: req.params.id,
    title: title ?? existing.title,
    description: description ?? existing.description,
    priority: priority ?? existing.priority,
    status: status ?? existing.status,
    customer_name: customer_name ?? existing.customer_name,
    customer_email: customer_email ?? existing.customer_email
  });

  const updated = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// POST /api/tickets/:id/summarize — AI-powered ticket analysis
router.post('/:id/summarize', async (req, res) => {
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: 'AI not configured. Set OPENAI_API_KEY environment variable.' });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a support ticket analyst. Analyze the following support ticket and provide:
1. A brief summary (2-3 sentences)
2. A suggested resolution or next step
3. Customer sentiment (positive/neutral/frustrated/angry)

Respond ONLY in valid JSON format: { "summary": "...", "suggestedResolution": "...", "sentiment": "..." }`
        },
        {
          role: 'user',
          content: `Title: ${ticket.title}\n\nDescription: ${ticket.description}\n\nCustomer: ${ticket.customer_name}\nPriority: ${ticket.priority}\nStatus: ${ticket.status}`
        }
      ],
      temperature: 0.3,
      max_tokens: 300
    });

    const content = completion.choices[0].message.content;
    const analysis = JSON.parse(content);
    res.json(analysis);
  } catch (err) {
    console.error('AI summarization error:', err.message);
    res.status(500).json({ error: 'Failed to generate AI summary. Please try again.' });
  }
});

// DELETE /api/tickets/:id — Delete a ticket
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);

  if (!existing) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  db.prepare('DELETE FROM tickets WHERE id = ?').run(req.params.id);
  res.json({ message: 'Ticket deleted successfully' });
});

module.exports = router;
