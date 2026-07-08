import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend);

const PIE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#6b7280'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const { stats, categoryStats, monthlyTrend, priorityStats } = data || {};
  const isDark = document.documentElement.classList.contains('dark');

  const gridColor = isDark ? '#374151' : '#e5e7eb';
  const tickColor = isDark ? '#9ca3af' : '#6b7280';

  const monthlyChart = {
    labels: (monthlyTrend || []).map(m => `${MONTHS[m._id.month - 1]} ${m._id.year}`),
    datasets: [{
      label: 'Complaints',
      data: (monthlyTrend || []).map(m => m.count),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const categoryChart = {
    labels: (categoryStats || []).map(c => c._id),
    datasets: [{ data: (categoryStats || []).map(c => c.count), backgroundColor: PIE_COLORS }]
  };

  const priorityChart = {
    labels: (priorityStats || []).map(p => p._id),
    datasets: [{
      label: 'By Priority',
      data: (priorityStats || []).map(p => p.count),
      backgroundColor: ['#9ca3af', '#3b82f6', '#f97316', '#ef4444']
    }]
  };

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: tickColor } } },
    scales: {
      x: { ticks: { color: tickColor }, grid: { color: gridColor } },
      y: { ticks: { color: tickColor }, grid: { color: gridColor } }
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Complaint Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Insights and trends across all grievances</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats?.totalComplaints, color: 'text-indigo-600' },
          { label: 'Resolution Rate', value: `${stats?.resolutionRate || 0}%`, color: 'text-green-600' },
          { label: 'Pending', value: stats?.pendingComplaints, color: 'text-yellow-600' },
          { label: 'Critical Open', value: stats?.criticalComplaints, color: 'text-red-600' }
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className={`text-3xl font-bold ${color}`}>{value ?? 0}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Complaint Trend</h2>
          <div className="h-64">
            {(monthlyTrend || []).length > 0 ? (
              <Line data={monthlyChart} options={{ ...chartOpts, scales: chartOpts.scales }} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No trend data</div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">By Category</h2>
          <div className="h-64">
            {(categoryStats || []).length > 0 ? (
              <Pie data={categoryChart} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: tickColor } } } }} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No category data</div>
            )}
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Priority Distribution</h2>
          <div className="h-64">
            {(priorityStats || []).length > 0 ? (
              <Bar data={priorityChart} options={chartOpts} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No priority data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
