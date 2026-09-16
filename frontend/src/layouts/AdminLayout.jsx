import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Coffee,
  LayoutDashboard,
  ListTree,
  LogOut,
  Package,
  Receipt,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Quản lý món', icon: Package },
  { to: '/admin/categories', label: 'Danh mục', icon: ListTree },
  { to: '/admin/orders', label: 'Đơn hàng', icon: Receipt },
  { to: '/admin/reports', label: 'Báo cáo', icon: BarChart3 },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <div className="flex min-h-screen bg-coffee-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 w-64 flex-col bg-coffee-950 text-cream-50 hidden md:flex">
        <div className="flex items-center gap-2 px-6 py-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-coffee-800">
            <Coffee size={18} />
          </span>
          <span className="font-serif text-lg font-bold">Ô Cà Phê</span>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive ? 'bg-coffee-800 text-cream-50' : 'text-cream-100/70 hover:bg-coffee-900'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-coffee-800 p-4">
          <p className="mb-2 truncate text-xs text-cream-100/60">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-cream-100/80 transition-colors hover:bg-coffee-900"
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Nội dung chính */}
      <div className="min-w-0 flex-1 md:ml-64">
        {/* Header mobile */}
        <div className="border-b border-coffee-100 bg-white md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-serif font-bold text-coffee-900">Ô Cà Phê Admin</span>
            <button onClick={handleLogout} className="text-sm text-coffee-600">Đăng xuất</button>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 scrollbar-hide">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                    isActive ? 'bg-coffee-800 text-cream-50' : 'bg-coffee-100 text-coffee-700'
                  }`
                }
              >
                <item.icon size={14} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
