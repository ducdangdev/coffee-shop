import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <h1 className="font-serif text-6xl font-bold text-coffee-800">404</h1>
      <p className="mt-3 text-coffee-600">Không tìm thấy trang bạn yêu cầu.</p>
      <Link to="/" className="btn-primary mt-6">Về trang chủ</Link>
    </div>
  );
}
