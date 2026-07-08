import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { SearchIcon, FilterIcon, EyeIcon, PlusCircleIcon } from '../../components/Icons';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Closed: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
};

const priorityColors = {
  Low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  Medium: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  High: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  Critical: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
};

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', category: '', search: '' });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false);

  const fetchComplaints = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);

      const res = await api.get(`/complaints?${params}`);
      setComplaints(res.data.complaints);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchComplaints(1); }, [fetchComplaints]);

  const clearFilters = () => setFilters({ status: '', priority: '', category: '', search: '' });
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Complaints</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {pagination.total} complaint{pagination.total !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link to="/dashboard/submit" className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <PlusCircleIcon className="w-4 h-4" />
          New Complaint
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              className="input-field pl-9"
              placeholder="Search complaints..."
              value={filters.search}
              onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
            />
          </div>
          <button
            onClick={() => setShowFilters(p => !p)}
            className={`btn-secondary flex items-center gap-2 ${hasFilters ? 'ring-2 ring-indigo-500' : ''}`}
          >
            <FilterIcon className="w-4 h-4" />
            Filters
            {hasFilters && <span className="w-2 h-2 bg-indigo-500 rounded-full" />}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <select className="input-field" value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}>
              <option value="">All Statuses</option>
              {['Pending', 'In Progress', 'Resolved', 'Rejected', 'Closed'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="input-field" value={filters.priority} onChange={e => setFilters(p => ({ ...p, priority: e.target.value }))}>
              <option value="">All Priorities</option>
              {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select className="input-field" value={filters.category} onChange={e => setFilters(p => ({ ...p, category: e.target.value }))}>
              <option value="">All Categories</option>
              {['Infrastructure', 'Academic', 'Administrative', 'Hostel', 'Library', 'IT Support', 'Safety', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {hasFilters && (
              <button onClick={clearFilters} className="text-sm text-red-500 hover:underline text-left">
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Complaints list */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-500 dark:text-gray-400 font-medium">No complaints found</p>
            {hasFilters && (
              <button onClick={clearFilters} className="text-sm text-indigo-600 hover:underline mt-2">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    {['Title', 'Category', 'Priority', 'Status', 'Submitted', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {complaints.map(c => (
                    <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate max-w-xs">{c.title}</p>
                        {c.nlpAnalysis?.escalationFlag && (
                          <span className="text-xs text-red-500">⚠ Escalation flagged</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{c.category}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${priorityColors[c.priority]}`}>{c.priority}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${statusColors[c.status]}`}>{c.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/dashboard/complaints/${c._id}`}
                          className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
                        >
                          <EyeIcon className="w-4 h-4" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
              {complaints.map(c => (
                <Link
                  key={c._id}
                  to={`/dashboard/complaints/${c._id}`}
                  className="block px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-medium text-gray-900 dark:text-white text-sm flex-1">{c.title}</p>
                    <span className={`badge flex-shrink-0 ${statusColors[c.status]}`}>{c.status}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{c.category}</span>
                    <span>•</span>
                    <span className={`badge ${priorityColors[c.priority]}`}>{c.priority}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.pages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchComplaints(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="btn-secondary py-1 px-3 text-sm disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchComplaints(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="btn-secondary py-1 px-3 text-sm disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
