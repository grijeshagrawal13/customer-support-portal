import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchStats, fetchTickets } from '../api/tickets';

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

const priorityColors = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchStats(), fetchTickets()])
      .then(([statsData, ticketsData]) => {
        setStats(statsData);
        setRecentTickets(ticketsData.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your support tickets</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-500">Total Tickets</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.total || 0}</p>
        </div>
        {stats?.byStatus?.map((item) => (
          <div key={item.status} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500 capitalize">{item.status.replace('_', ' ')}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{item.count}</p>
            <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
              {item.status.replace('_', ' ')}
            </span>
          </div>
        ))}
      </div>

      {/* Priority Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">By Priority</h2>
          <div className="space-y-3">
            {stats?.byPriority?.map((item) => (
              <div key={item.priority} className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${priorityColors[item.priority]}`}>
                  {item.priority}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${(item.count / stats.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-8 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">By Status</h2>
          <div className="space-y-3">
            {stats?.byStatus?.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[item.status]}`}>
                  {item.status.replace('_', ' ')}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${(item.count / stats.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-8 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Tickets</h2>
          <Link to="/tickets" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentTickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/tickets/${ticket.id}`}
              className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{ticket.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{ticket.customer_name} · {new Date(ticket.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
                  {ticket.priority}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
