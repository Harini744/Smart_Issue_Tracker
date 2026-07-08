import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1', keywords: '' });
  const [showForm, setShowForm] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', {
        ...form,
        keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean)
      });
      toast.success('Category created');
      setForm({ name: '', description: '', color: '#6366f1', keywords: '' });
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deactivated');
      fetchCategories();
    } catch {
      toast.error('Failed to deactivate');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Issue Categories</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage complaint categories and NLP keywords</p>
        </div>
        <button onClick={() => setShowForm(p => !p)} className="btn-danger self-start">
          {showForm ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">New Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input className="input-field" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
              <input type="color" className="h-10 w-full rounded-lg cursor-pointer" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <input className="input-field" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keywords (comma-separated)</label>
            <input className="input-field" placeholder="building, water, electricity" value={form.keywords} onChange={e => setForm(p => ({ ...p, keywords: e.target.value }))} />
          </div>
          <button type="submit" className="btn-danger">Create Category</button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat._id} className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: cat.color }}>
                {cat.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{cat.name}</h3>
                <p className="text-xs text-gray-500">{cat.description}</p>
              </div>
            </div>
            {cat.keywords?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {cat.keywords.slice(0, 5).map(kw => (
                  <span key={kw} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">{kw}</span>
                ))}
              </div>
            )}
            <button onClick={() => handleDeactivate(cat._id)} className="text-xs text-red-500 hover:underline">Deactivate</button>
          </div>
        ))}
      </div>
    </div>
  );
}
