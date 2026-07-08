import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { UploadIcon, XIcon, ExclamationIcon, CheckCircleIcon } from '../../components/Icons';

const CATEGORIES = [
  'Infrastructure', 'Academic', 'Administrative', 'Hostel',
  'Library', 'IT Support', 'Safety', 'Other'
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const priorityInfo = {
  Low: { color: 'text-gray-600 bg-gray-100', desc: 'Minor issue, no urgency' },
  Medium: { color: 'text-blue-600 bg-blue-100', desc: 'Moderate impact' },
  High: { color: 'text-orange-600 bg-orange-100', desc: 'Significant impact' },
  Critical: { color: 'text-red-600 bg-red-100', desc: 'Urgent, needs immediate attention' }
};

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const analyzeTimer = useRef(null);

  const [form, setForm] = useState({
    title: '', description: '', category: '', priority: 'Medium',
    isAnonymous: false, tags: ''
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [nlpResult, setNlpResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Auto-analyze with NLP as user types
  useEffect(() => {
    if (form.title.length < 5 && form.description.length < 10) return;
    clearTimeout(analyzeTimer.current);
    analyzeTimer.current = setTimeout(async () => {
      setAnalyzing(true);
      try {
        const res = await api.post('/complaints/analyze', {
          title: form.title,
          description: form.description
        });
        setNlpResult(res.data.analysis);
        // Auto-fill if not manually set
        if (!form.category && res.data.analysis.suggestedCategory !== 'Other') {
          setForm(p => ({ ...p, category: res.data.analysis.suggestedCategory }));
        }
      } catch {}
      setAnalyzing(false);
    }, 800);
    return () => clearTimeout(analyzeTimer.current);
  }, [form.title, form.description]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    const newImages = [...images, ...files];
    setImages(newImages);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setPreviews(p => [...p, ...newPreviews]);
  };

  const removeImage = (idx) => {
    URL.revokeObjectURL(previews[idx]);
    setImages(p => p.filter((_, i) => i !== idx));
    setPreviews(p => p.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    else if (form.title.length < 5) errs.title = 'Title must be at least 5 characters';
    if (!form.description.trim()) errs.description = 'Description is required';
    else if (form.description.length < 20) errs.description = 'Description must be at least 20 characters';
    if (!form.category) errs.category = 'Please select a category';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      images.forEach(img => formData.append('images', img));

      const res = await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Complaint submitted successfully!');
      navigate(`/dashboard/complaints/${res.data.complaint._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const applyNlpSuggestion = () => {
    if (!nlpResult) return;
    setForm(p => ({
      ...p,
      priority: nlpResult.detectedPriority,
      category: nlpResult.suggestedCategory !== 'Other' ? nlpResult.suggestedCategory : p.category
    }));
    toast.success('AI suggestions applied!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Submit a Complaint</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Our AI engine will analyze your complaint and suggest priority and category
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Complaint Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`input-field ${errors.title ? 'border-red-500' : ''}`}
              placeholder="Brief summary of your issue"
              value={form.title}
              onChange={e => { setForm(p => ({ ...p, title: e.target.value })); setErrors(p => ({ ...p, title: '' })); }}
              maxLength={200}
            />
            <div className="flex justify-between mt-1">
              {errors.title ? <p className="text-red-500 text-xs">{errors.title}</p> : <span />}
              <span className="text-xs text-gray-400">{form.title.length}/200</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              className={`input-field resize-none ${errors.description ? 'border-red-500' : ''}`}
              placeholder="Describe your issue in detail. Include when it started, how it affects you, and any steps already taken..."
              value={form.description}
              onChange={e => { setForm(p => ({ ...p, description: e.target.value })); setErrors(p => ({ ...p, description: '' })); }}
              maxLength={2000}
            />
            <div className="flex justify-between mt-1">
              {errors.description ? <p className="text-red-500 text-xs">{errors.description}</p> : <span />}
              <span className="text-xs text-gray-400">{form.description.length}/2000</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                className={`input-field ${errors.category ? 'border-red-500' : ''}`}
                value={form.category}
                onChange={e => { setForm(p => ({ ...p, category: e.target.value })); setErrors(p => ({ ...p, category: '' })); }}
              >
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select
                className="input-field"
                value={form.priority}
                onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
              >
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <p className="text-xs text-gray-400 mt-1">{priorityInfo[form.priority]?.desc}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags <span className="text-gray-400 font-normal">(optional, comma-separated)</span>
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. urgent, block-a, semester-5"
              value={form.tags}
              onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-indigo-600 rounded"
              checked={form.isAnonymous}
              onChange={e => setForm(p => ({ ...p, isAnonymous: e.target.checked }))}
            />
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Submit anonymously</span>
              <p className="text-xs text-gray-400">Your name won't be shown to other students</p>
            </div>
          </label>
        </div>

        {/* AI Analysis Panel */}
        {(analyzing || nlpResult) && (
          <div className="card border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
                <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 text-sm">NLP Analysis</h3>
                {analyzing && <span className="text-xs text-indigo-500 animate-pulse">Analyzing...</span>}
              </div>
              {nlpResult && (
                <button type="button" onClick={applyNlpSuggestion}
                  className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full hover:bg-indigo-700 transition-colors">
                  Apply Suggestions
                </button>
              )}
            </div>

            {nlpResult && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Detected Priority</p>
                  <span className={`badge ${priorityInfo[nlpResult.detectedPriority]?.color}`}>
                    {nlpResult.detectedPriority}
                  </span>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Suggested Category</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{nlpResult.suggestedCategory}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Sentiment Score</p>
                  <p className={`text-sm font-medium ${nlpResult.sentimentScore < -0.3 ? 'text-red-600' : nlpResult.sentimentScore > 0.1 ? 'text-green-600' : 'text-gray-600'}`}>
                    {nlpResult.sentimentScore > 0 ? '+' : ''}{nlpResult.sentimentScore.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Escalation</p>
                  <div className="flex items-center gap-1">
                    {nlpResult.escalationFlag
                      ? <><ExclamationIcon className="w-4 h-4 text-red-500" /><span className="text-xs text-red-600 font-medium">Flagged</span></>
                      : <><CheckCircleIcon className="w-4 h-4 text-green-500" /><span className="text-xs text-green-600">Normal</span></>
                    }
                  </div>
                </div>
              </div>
            )}

            {nlpResult?.keywords?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-2">Detected keywords:</p>
                <div className="flex flex-wrap gap-1">
                  {nlpResult.keywords.map(kw => (
                    <span key={kw} className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Image upload */}
        <div className="card space-y-4">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Evidence Images</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Upload up to 5 images (max 5MB each)</p>
          </div>

          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors"
          >
            <UploadIcon className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload images</p>
            <p className="text-xs text-gray-400 mt-1">JPEG, PNG, GIF, WebP up to 5MB</p>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {previews.map((src, i) => (
                <div key={i} className="relative group aspect-square">
                  <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-secondary flex-1 sm:flex-none sm:px-8"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 sm:flex-none sm:px-8 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting...
              </>
            ) : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </div>
  );
}
