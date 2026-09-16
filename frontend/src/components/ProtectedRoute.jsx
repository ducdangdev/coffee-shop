import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Chỉ cho phép vào nếu đã đăng nhập VÀ có quyền admin.
export default function ProtectedRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-coffee-950">
        <p className="text-cream-50">Đang tải...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
