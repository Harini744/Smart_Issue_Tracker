import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUSES = ['Pending', 'In Progress', 'Resolved', 'Rejected', 'Closed'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Resolved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
  Closed: 'bg-gray-100 text-gray-700'
};

const priorityColors = {
  Low: 'bg-gray-100 text-gray-600',
  Medium: 'bg-blue-100 text-blue-600',
  High: 'bg-orange-100 text-orange-600',
  Critical: 'bg-red-100 text-red-600'
};

export default function AdminComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchComplaint = async () => {
    try {
      const res = await api.get(`/complaints/${id}`);
      setComplaint(res.data.complaint);
      setStatus(res.data.complaint.status);
      setPriority(res.data.complaint.priority);
    } catch {
      toast.error('Failed to load complaint');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaint(); }, [id]);

  const handleStatusUpdate = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/admin/complaints/${id}/status`, { status, adminNote });
      setComplaint(res.data.complaint);
      setAdminNote('');
      toast.success('Status updated');
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePriorityUpdate = async () => {
    try {
      const res = await api.put(`/admin/complaints/${id}/priority`, { priority });
      setComplaint(res.data.complaint);
      toast.success('Priority updated');
    } catch {
      toast.error('Priority update failed');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await api.post(`/complaints/${id}/comments`, { text: comment });
      setComment('');
      fetchComplaint();
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Complaint not found</p>
        <Link to="/admin/complaints" className="text-red-600 hover:underline mt-2 inline-block">Back to list</Link>
      </div>
    );
  }

  const apiBase = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">
      <div className="flex items-center gap-4">
        <Link to="/admin/complaints" className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">← Back</Link>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{complaint.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Submitted {format(new Date(complaint.createdAt), 'PPP')} by {complaint.student?.name}
              {complaint.student?.studentId && ` (${complaint.student.studentId})`}
            </p>
          </div>
          <div className="flex gap-2">
            <span className={`badge ${priorityColors[complaint.priority]}`}>{complaint.priority}</span>
            <span className={`badge ${statusColors[complaint.status]}`}>{complaint.status}</span>
          </div>
        </div>

        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{complaint.description}</p>

        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
          <span>Category: <strong className="text-gray-900 dark:text-white">{complaint.category}</strong></span>
          {complaint.tags?.length > 0 && (
            <span>Tags: {complaint.tags.map(t => (
              <span key={t} className="ml-1 badge bg-gray-100 text-gray-600">{t}</span>
            ))}</span>
          )}
        </div>

        {complaint.images?.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {complaint.images.map((img, i) => (
              <div key={i}>
                <img
                  src={img.url.startsWith('http') ? img.url : `${apiBase}${img.url}`}
                  alt={`Evidence ${i + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                />
                {img.aiCategory && (
                  <p className="text-xs text-indigo-600 mt-1">AI: {img.aiCategory} ({(img.aiConfidence * 100).toFixed(0)}%)</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Analysis */}
      {(complaint.nlpAnalysis || complaint.visionAnalysis) && (
        <div className="card border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">AI Analysis</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {complaint.nlpAnalysis && (
              <>
                <div><p className="text-gray-500 text-xs">NLP Priority</p><p className="font-medium">{complaint.nlpAnalysis.detectedPriority}</p></div>
                <div><p className="text-gray-500 text-xs">Suggested Category</p><p className="font-medium">{complaint.nlpAnalysis.suggestedCategory}</p></div>
                <div><p className="text-gray-500 text-xs">Sentiment</p><p className="font-medium">{complaint.nlpAnalysis.sentimentScore}</p></div>
                <div><p className="text-gray-500 text-xs">Escalation</p><p className="font-medium">{complaint.nlpAnalysis.escalationFlag ? 'Yes' : 'No'}</p></div>
              </>
            )}
            {complaint.visionAnalysis && (
              <div><p className="text-gray-500 text-xs">Vision Category</p><p className="font-medium">{complaint.visionAnalysis.detectedCategory}</p></div>
            )}
          </div>
        </div>
      )}

      {/* Admin actions */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Update Complaint</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select className="input-field" value={status} onChange={e => setStatus(e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
            <div className="flex gap-2">
              <select className="input-field flex-1" value={priority} onChange={e => setPriority(e.target.value)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <button type="button" onClick={handlePriorityUpdate} className="btn-secondary text-sm">Save</button>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin note (optional)</label>
          <textarea className="input-field resize-none" rows={2} value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Note visible in comments..." />
        </div>
        <button onClick={handleStatusUpdate} disabled={saving} className="btn-danger">
          {saving ? 'Updating...' : 'Update Status & Notify Student'}
        </button>
      </div>

      {/* Comments */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Comments</h2>
        {complaint.comments?.length > 0 ? (
          <div className="space-y-3">
            {complaint.comments.map((c, i) => (
              <div key={i} className={`p-3 rounded-lg ${c.isAdmin ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                <p className="text-xs text-gray-500 mb-1">{c.user?.name} · {c.isAdmin ? 'Admin' : 'Student'}</p>
                <p className="text-sm text-gray-800 dark:text-gray-200">{c.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No comments yet</p>
        )}
        <form onSubmit={handleComment} className="flex gap-2">
          <input className="input-field flex-1" value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." />
          <button type="submit" className="btn-danger">Send</button>
        </form>
      </div>
    </div>
  );
}
