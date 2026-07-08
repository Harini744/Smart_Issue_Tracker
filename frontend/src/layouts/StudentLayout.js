import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';
import {
  HomeIcon, PlusCircleIcon, ClipboardListIcon,
  UserIcon, LogoutIcon, MenuIcon, XIcon
} from '../components/Icons';

const navItems = [
  { to: '/dashboard', icon: HomeIcon, label: 'Dashboard', end: true },
  { to: '/dashboard/submit', icon: PlusCircleIcon, label: 'Submit Complaint' },
  { to: '/dashboard/complaints', icon: ClipboardListIcon, label: 'My Complaints' },
  { to: '/dashboard/profile', icon: UserIcon, label: 'Profile' }
];

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-50 to-white">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="w-9 h-9 bg-gradient-primary rounded-lg flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-sm">SIT</span>
        </div>
        <div>
          <p className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-sm">Smart Issue Tracker</p>
          <p className="text-xs text-blue-600">Student Portal</p>
        </div>
      </div>

      <div className="px-4 py-4 border-b border-blue-100">
        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-100">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white shadow-md">
            <span className="font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
            <p className="text-xs text-blue-600 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-blue-100">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogoutIcon className="w-5 h-5" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-blue-100 flex-shrink-0 shadow-header">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/20" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-64 bg-white border-r border-blue-100 slide-in shadow-xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-blue-100"
            >
              <XIcon className="w-5 h-5 text-blue-600" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-blue-100 px-4 py-3 flex items-center justify-between flex-shrink-0 shadow-header">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-blue-50"
          >
            <MenuIcon className="w-5 h-5 text-blue-600" />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
