import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import {
  ClipboardListIcon, CheckCircleIcon, ExclamationIcon, PlusCircleIcon
} from '../../components/Icons';

const statusColors = {
  Pending: 'badge-warning',
  'In Progress': 'badge-primary',
  Resolved: 'badge-success',
  Rejected: 'badge-danger',
  Closed: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
};

const priorityColors = {
  Low: 'bg-green-100 text-green-700 border border-green-300',
  Medium: 'bg-blue-100 text-blue-700 border border-blue-300',
  High: 'bg-orange-100 text-orange-700 border border-orange-300',
  Critical: 'bg-red-100 text-red-700 border border-red-300'
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, inProgress: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/complaints?limit=5');
        const complaints = res.data.complaints || [];
        setRecent(complaints);
        setStats({
          total: res.data.pagination?.total || complaints.length,
          pending: complaints.filter(c => c.status === 'Pending').length,
          resolved: complaints.filter(c => c.status === 'Resolved').length,
          inProgress: complaints.filter(c => c.status === 'In Progress').length
        });
        // Fetch all for accurate stats
        const allRes = await api.get('/complaints?limit=100');
        const all = allRes.data.complaints || [];
        setStats({
          total: allRes.data.pagination?.total || all.length,
          pending: all.filter(c => c.status === 'Pending').length,
          resolved: all.filter(c => c.status === 'Resolved').length,
          inProgress: all.filter(c => c.status === 'In Progress').length
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Complaints', value: stats.total, icon: ClipboardListIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending', value: stats.pending, icon: ExclamationIcon, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'In Progress', value: stats.inProgress, icon: RefreshIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircleIcon, color: 'text-green-600', bg: 'bg-green-50' }
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Here's an overview of your complaints
          </p>
        </div>
        <Link to="/dashboard/submit" className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <PlusCircleIcon className="w-4 h-4" />
          New Complaint
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className={`text-2xl font-bold ${color}`}>{value}</span>
            </div>
            <p className="text-sm text-slate-600">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent complaints */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="font-semibold text-slate-900">Recent Complaints</h2>
          <Link to="/dashboard/complaints" className="text-sm text-blue-600 hover:text-purple-600 transition-colors font-medium">
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <ClipboardListIcon className="w-12 h-12 text-blue-200 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No complaints yet</p>
            <p className="text-slate-500 text-sm mt-1">Submit your first complaint to get started</p>
            <Link to="/dashboard/submit" className="btn-primary inline-flex items-center gap-2 mt-4">
              <PlusCircleIcon className="w-4 h-4" />
              Submit Complaint
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-blue-100">
            {recent.map(c => (
              <Link
                key={c._id}
                to={`/dashboard/complaints/${c._id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-blue-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{c.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-blue-600 font-medium">{c.category}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`badge ${priorityColors[c.priority]}`}>{c.priority}</span>
                  <span className={`badge ${statusColors[c.status]}`}>{c.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick tips */}
      <div className="card bg-gradient-accent border border-pink-200 shadow-md">
        <h3 className="font-semibold text-pink-700 mb-3">💡 Tips for faster resolution</h3>
        <ul className="space-y-2 text-sm text-pink-600">
          <li>• Be specific in your complaint title and description</li>
          <li>• Upload images as evidence to help admins understand the issue</li>
          <li>• Our AI engine automatically detects priority — use urgent keywords for critical issues</li>
          <li>• Check your notifications for status updates</li>
        </ul>
      </div>
    </div>
  );
}

// Inline RefreshIcon since it's used here
function RefreshIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}
