import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './api/auth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TicketList from './components/TicketList';
import TicketDetail from './components/TicketDetail';
import TicketForm from './components/TicketForm';
import Login from './components/Login';
import Signup from './components/Signup';

function ProtectedRoute({ children, authed, onLogout }) {
  if (!authed) return <Navigate to="/login" replace />;
  return <Layout onLogout={onLogout}>{children}</Layout>;
}

export default function App() {
  const [authed, setAuthed] = useState(isAuthenticated());

  const handleAuth = () => setAuthed(true);
  const handleLogout = () => setAuthed(false);

  return (
    <Routes>
      <Route path="/login" element={authed ? <Navigate to="/" replace /> : <Login onAuth={handleAuth} />} />
      <Route path="/signup" element={authed ? <Navigate to="/" replace /> : <Signup onAuth={handleAuth} />} />
      <Route path="/" element={<ProtectedRoute authed={authed} onLogout={handleLogout}><Dashboard /></ProtectedRoute>} />
      <Route path="/tickets" element={<ProtectedRoute authed={authed} onLogout={handleLogout}><TicketList /></ProtectedRoute>} />
      <Route path="/tickets/new" element={<ProtectedRoute authed={authed} onLogout={handleLogout}><TicketForm /></ProtectedRoute>} />
      <Route path="/tickets/:id" element={<ProtectedRoute authed={authed} onLogout={handleLogout}><TicketDetail /></ProtectedRoute>} />
    </Routes>
  );
}
