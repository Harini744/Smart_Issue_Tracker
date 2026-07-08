import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { EyeIcon } from '../components/Icons';

const EyeOffIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-purple-600 font-bold">SIT</span>
          </div>
          <span className="font-semibold text-xl">Smart Issue Tracker</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Professional Issue<br />Management System
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-md">
            Streamlined grievance tracking with AI-powered prioritization and real-time status updates.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Complaints Resolved', value: '2,400+' },
              { label: 'Avg Resolution Time', value: '2.3 days' },
              { label: 'Student Satisfaction', value: '94%' },
              { label: 'Active Users', value: '1,200+' }
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-lg">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-blue-100 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-blue-100 text-sm">© 2024 Smart Issue Tracking System</p>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">SIT</span>
            </div>
            <span className="font-semibold text-slate-900">Smart Issue Tracker</span>
          </div>

          <div className="card shadow-md border-blue-200">
            <h2 className="page-title mb-1">Sign in</h2>
            <p className="text-slate-500 mb-6 text-sm">Enter your credentials to access your account</p>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
                <input
                  type="email"
                  className={`input-field ${errors.email ? 'border-red-500 focus:ring-red-300' : ''}`}
                  placeholder="you@college.edu"
                  value={form.email}
                  onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })); }}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`input-field pr-10 ${errors.password ? 'border-red-500 focus:ring-red-300' : ''}`}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: '' })); }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700 font-semibold mb-1">Demo Credentials</p>
              <p className="text-xs text-slate-600">Admin: admin@college.edu / admin123</p>
              <p className="text-xs text-slate-600">Student: student@college.edu / student123</p>
            </div>

            <p className="text-center text-sm text-slate-500 mt-4">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 font-medium hover:text-purple-600 transition-colors">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
