export async function login(email, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  localStorage.setItem('token', data.token);
  localStorage.setItem('email', data.email);
  return data;
}

export async function signup(email, password) {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Signup failed');
  localStorage.setItem('token', data.token);
  localStorage.setItem('email', data.email);
  return data;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('email');
}

export function isAuthenticated() {
  return !!localStorage.getItem('token');
}

export function getCurrentEmail() {
  return localStorage.getItem('email');
}
