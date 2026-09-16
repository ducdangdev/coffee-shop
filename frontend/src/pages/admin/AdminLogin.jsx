import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Coffee, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Nếu đã đăng nhập rồi -> chuyển thẳng vào dashboard
  if (!loading && user?.role === 'admin') {
    const from = location.state?.from?.pathname || '/admin';
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-coffee-950 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-coffee-800 text-cream-50">
            <Coffee size={22} />
          </span>
          <h1 className="font-serif text-xl font-bold text-coffee-900">Đăng nhập Admin</h1>
          <p className="mt-1 text-sm text-coffee-500">Ô Cà Phê - Quản trị hệ thống</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-coffee-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-coffee-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-coffee-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-coffee-700">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400" size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-coffee-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-coffee-500"
              />
            </div>
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
            {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

      </div>
    </div>
  );
}
