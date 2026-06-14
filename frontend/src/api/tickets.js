const BASE_URL = '/api/tickets';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function handleResponse(res) {
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  return res;
}

export async function fetchTickets(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.search) params.set('search', filters.search);

  const url = params.toString() ? `${BASE_URL}?${params}` : BASE_URL;
  const res = await handleResponse(await fetch(url, { headers: getAuthHeaders() }));
  if (!res.ok) throw new Error('Failed to fetch tickets');
  return res.json();
}

export async function fetchTicket(id) {
  const res = await handleResponse(await fetch(`${BASE_URL}/${id}`, { headers: getAuthHeaders() }));
  if (!res.ok) throw new Error('Failed to fetch ticket');
  return res.json();
}

export async function createTicket(data) {
  const res = await handleResponse(await fetch(BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  }));
  if (!res.ok) throw new Error('Failed to create ticket');
  return res.json();
}

export async function updateTicket(id, data) {
  const res = await handleResponse(await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  }));
  if (!res.ok) throw new Error('Failed to update ticket');
  return res.json();
}

export async function deleteTicket(id) {
  const res = await handleResponse(await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  }));
  if (!res.ok) throw new Error('Failed to delete ticket');
  return res.json();
}

export async function fetchStats() {
  const res = await handleResponse(await fetch(`${BASE_URL}/stats`, { headers: getAuthHeaders() }));
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function summarizeTicket(id) {
  const res = await handleResponse(await fetch(`${BASE_URL}/${id}/summarize`, {
    method: 'POST',
    headers: getAuthHeaders()
  }));
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to summarize ticket');
  return data;
}
