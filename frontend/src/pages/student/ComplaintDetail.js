import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { formatDistanceToNow, format } from 'date-fns';

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

const statusSteps = ['Pending', 'In Progress', 'Resolved'];

export default function ComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/complaints/${id}`);
        setComplaint(res.data.complaint);
      } catch {
        toast.error('Complaint not found');
        navigate('/dashboard/complaints');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/complaints/${id}/comments`, { text: comment });
      setComplaint(p => ({ ...p, comments: res.data.comments }));
      setComment('');
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  );

  if (!complaint) return null;

  const currentStep = statusSteps.indexOf(complaint.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{complaint.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Submitted {formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status tracker */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Status Progress</h2>
            <div className="flex items-center">
              {statusSteps.map((step, i) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      i <= currentStep
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                    }`}>
                      {i < currentStep ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs mt-1 font-medium ${i <= currentStep ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
                      {step}
                    </span>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded transition-colors ${i < currentStep ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            {complaint.status === 'Rejected' && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">This complaint was rejected</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Description</h2>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {complaint.description}
            </p>
            {complaint.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {complaint.tags.map(tag => (
                  <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Images */}
          {complaint.images?.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Attached Images</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {complaint.images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img.url}
                      alt={`Evidence ${i + 1}`}
                      className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage(img.url)}
                    />
                    {img.aiCategory && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 rounded-b-lg">
                        AI: {img.aiCategory} ({Math.round((img.aiConfidence || 0) * 100)}%)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NLP Analysis */}
          {complaint.nlpAnalysis && (
            <div className="card border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
                <h2 className="font-semibold text-gray-900 dark:text-white">AI Analysis</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Detected Priority</p>
                  <span className={`badge ${priorityColors[complaint.nlpAnalysis.detectedPriority]}`}>
                    {complaint.nlpAnalysis.detectedPriority}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Suggested Category</p>
                  <p className="font-medium text-gray-900 dark:text-white">{complaint.nlpAnalysis.suggestedCategory}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Sentiment</p>
                  <p className={`font-medium ${complaint.nlpAnalysis.sentimentScore < -0.3 ? 'text-red-600' : 'text-green-600'}`}>
                    {complaint.nlpAnalysis.sentimentScore > 0 ? '+' : ''}{complaint.nlpAnalysis.sentimentScore}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Escalation</p>
                  <p className={`font-medium ${complaint.nlpAnalysis.escalationFlag ? 'text-red-600' : 'text-green-600'}`}>
                    {complaint.nlpAnalysis.escalationFlag ? '⚠ Flagged' : '✓ Normal'}
                  </p>
                </div>
              </div>
              {complaint.nlpAnalysis.keywords?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {complaint.nlpAnalysis.keywords.map(kw => (
                    <span key={kw} className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Comments */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
              Comments ({complaint.comments?.length || 0})
            </h2>

            <div className="space-y-4 mb-4">
              {complaint.comments?.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No comments yet</p>
              ) : (
                complaint.comments.map(c => (
                  <div key={c._id} className={`flex gap-3 ${c.isAdmin ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                      c.isAdmin ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'
                    }`}>
                      {c.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className={`flex-1 ${c.isAdmin ? 'items-end' : ''}`}>
                      <div className={`rounded-xl p-3 text-sm ${
                        c.isAdmin
                          ? 'bg-red-50 dark:bg-red-900/20 text-gray-800 dark:text-gray-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-xs">{c.user?.name}</span>
                          {c.isAdmin && <span className="badge bg-red-100 text-red-600 text-xs">Admin</span>}
                        </div>
                        <p>{c.text}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 px-1">
                        {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={submitComment} className="flex gap-3">
              <input
                type="text"
                className="input-field flex-1"
                placeholder="Add a comment..."
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
              <button type="submit" disabled={submitting || !comment.trim()} className="btn-primary px-4">
                {submitting ? '...' : 'Send'}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Details</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Status</dt>
                <dd className="mt-1"><span className={`badge ${statusColors[complaint.status]}`}>{complaint.status}</span></dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Priority</dt>
                <dd className="mt-1"><span className={`badge ${priorityColors[complaint.priority]}`}>{complaint.priority}</span></dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Category</dt>
                <dd className="mt-1 font-medium text-gray-900 dark:text-white">{complaint.category}</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Submitted</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">
                  {format(new Date(complaint.createdAt), 'MMM d, yyyy')}
                </dd>
              </div>
              {complaint.resolvedAt && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Resolved</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {format(new Date(complaint.resolvedAt), 'MMM d, yyyy')}
                  </dd>
                </div>
              )}
              {complaint.assignedTo && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Assigned To</dt>
                  <dd className="mt-1 font-medium text-gray-900 dark:text-white">{complaint.assignedTo.name}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Anonymous</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">{complaint.isAnonymous ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Image lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img src={selectedImage} alt="Full size" className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </div>
  );
}
