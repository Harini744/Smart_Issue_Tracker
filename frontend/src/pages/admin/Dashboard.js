import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Closed: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
};

const priorityColors = {
  Low: 'bg-gray-100 text-gray-600',
  Medium: 'bg-blue-100 text-blue-600',
  High: 'bg-orange-100 text-orange-600',
  Critical: 'bg-red-100 text-red-600'
};

const PIE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#6b7280'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const isDark = document.documentElement.classList.contains('dark');

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
      </div>
    );
  }

  const { stats, recentComplaints, categoryStats, monthlyTrend } = data || {};

  const monthlyData = {
    labels: (monthlyTrend || []).map(m => MONTHS[m._id.month - 1]),
    datasets: [{
      label: 'Complaints',
      data: (monthlyTrend || []).map(m => m.count),
      backgroundColor: '#6366f1',
      borderRadius: 6
    }]
  };

  const pieData = {
    labels: (categoryStats || []).map(c => c._id),
    datasets: [{
      data: (categoryStats || []).map(c => c.count),
      backgroundColor: PIE_COLORS,
      borderWidth: 0
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: isDark ? '#9ca3af' : '#6b7280' }, grid: { color: isDark ? '#374151' : '#e5e7eb' } },
      y: { ticks: { color: isDark ? '#9ca3af' : '#6b7280' }, grid: { color: isDark ? '#374151' : '#e5e7eb' } }
    }
  };

  const statCards = [
    { label: 'Total Complaints', value: stats?.totalComplaints, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800' },
    { label: 'Pending', value: stats?.pendingComplaints, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800' },
    { label: 'In Progress', value: stats?.inProgressComplaints, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800' },
    { label: 'Resolved', value: stats?.resolvedComplaints, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800' },
    { label: 'High Priority', value: stats?.highPriorityComplaints, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800' },
    { label: 'Critical', value: stats?.criticalComplaints, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' },
    { label: 'Total Students', value: stats?.totalStudents, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800' },
    { label: 'Resolution Rate', value: `${stats?.resolutionRate || 0}%`, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'border-teal-200 dark:border-teal-800' }
  ];

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Overview of all complaints and system activity</p>
        </div>
        <Link to="/admin/complaints" className="btn-danger flex items-center gap-2 self-start sm:self-auto">
          Manage Complaints
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map(({ label, value, color, bg, border }) => (
          <div key={label} className={`card p-4 border ${border}`}>
            <p className={`text-2xl font-bold ${color}`}>{value ?? '—'}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Complaints (Last 6 Months)</h2>
          <div className="h-56">
            {(monthlyTrend || []).length > 0 ? (
              <Bar data={monthlyData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data yet</div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Complaints by Category</h2>
          <div className="h-56">
            {(categoryStats || []).length > 0 ? (
              <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: isDark ? '#9ca3af' : '#374151', boxWidth: 12 } } } }} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data yet</div>
            )}
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Complaints</h2>
          <Link to="/admin/complaints" className="text-sm text-red-600 dark:text-red-400 hover:underline">View all</Link>
        </div>

        {!recentComplaints?.length ? (
          <div className="py-12 text-center text-gray-400 text-sm">No complaints yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  {['Student', 'Title', 'Category', 'Priority', 'Status', 'Time', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {recentComplaints.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{c.student?.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">{c.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{c.category}</td>
                    <td className="px-4 py-3"><span className={`badge ${priorityColors[c.priority]}`}>{c.priority}</span></td>
                    <td className="px-4 py-3"><span className={`badge ${statusColors[c.status]}`}>{c.status}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/complaints/${c._id}`} className="text-red-600 hover:underline text-sm">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
