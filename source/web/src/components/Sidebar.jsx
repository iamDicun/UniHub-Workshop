import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Shield,
  Users,
  CreditCard,
  Upload,
  AlertTriangle,
  LogOut,
  Plus,
  User,
  ScanLine,
} from 'lucide-react';
import { getStoredUser, getRoleLabel, clearSession, getHomeForRole } from '../utils/auth';

const navConfigs = {
  admin: [
    { label: 'Tổng quan', icon: LayoutDashboard, to: '/admin' },
    { label: 'Workshops', icon: Calendar, to: '/admin' },
    { label: 'Thống kê', icon: BarChart3, to: '/admin/stats' },
    { label: 'Giao dịch', icon: CreditCard, to: '/admin/payments' },
    { label: 'Đồng bộ SV', icon: Upload, to: '/admin/sync-users' },
    { label: 'System Status', icon: Shield, to: '/admin/failed-jobs' },
  ],
  staff: [
    { label: 'Check-in', icon: ScanLine, to: '/staff' },
    { label: 'Workshops', icon: Calendar, to: '/staff' },
    { label: 'Phân tích', icon: BarChart3, to: '/staff' },
  ],
  student: [
    { label: 'Khám phá', icon: LayoutDashboard, to: '/student' },
    { label: 'Giao dịch', icon: CreditCard, to: '/student/payments' },
  ],
};

const Sidebar = () => {
  const user = getStoredUser();
  const location = useLocation();
  const navItems = user ? (navConfigs[user.role] || navConfigs.student) : [];

  const isActive = (to) => {
    if (to === '/admin' || to === '/staff' || to === '/student') {
      return location.pathname === to;
    }
    return location.pathname.startsWith(to);
  };

  const handleLogout = () => {
    clearSession();
    window.location.href = '/login';
  };

  const roleLabel = user ? getRoleLabel(user.role) : '';

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-border bg-background">
      <div className="px-5 pt-6 pb-4">
        <Link to={user ? getHomeForRole(user.role) : '/login'} className="block">
          <h1 className="font-display text-lg font-semibold tracking-tight text-primary">
            UniHub
          </h1>
          <p className="mt-0.5 text-xs text-text-secondary">
            {roleLabel} Console
          </p>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                active
                  ? 'bg-hover text-primary'
                  : 'text-text-secondary hover:bg-hover hover:text-primary'
              }`}
            >
              <Icon size={18} strokeWidth={1.75} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {user?.role === 'admin' && (
        <div className="px-3 pb-3">
          <Link
            to="/admin"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus size={16} strokeWidth={2} />
            Workshop Mới
          </Link>
        </div>
      )}

      <div className="border-t border-border px-3 py-4">
        <Link
          to="/profile"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-hover hover:text-primary"
        >
          <User size={18} strokeWidth={1.75} />
          Hồ sơ
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-hover hover:text-primary"
        >
          <LogOut size={18} strokeWidth={1.75} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
