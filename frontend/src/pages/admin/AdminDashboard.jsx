import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Package, Receipt, ShoppingBag } from 'lucide-react';
import { dashboardApi } from '../../api/auth.api';
import { formatCurrency } from '../../utils/format';
import OrderStatusBadge from '../../components/admin/OrderStatusBadge';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi
      .getStats()
      .then((res) => setStats(res.data))
      .catch(() => setError('Không thể tải dữ liệu thống kê.'))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: 'Tổng doanh thu', value: formatCurrency(stats.total_revenue), icon: DollarSign, color: 'bg-green-100 text-green-700' },
        { label: 'Tổng đơn hàng', value: stats.total_orders, icon: Receipt, color: 'bg-blue-100 text-blue-700' },
        { label: 'Tổng sản phẩm', value: stats.total_products, icon: Package, color: 'bg-purple-100 text-purple-700' },
        { label: 'Đơn hàng mới', value: stats.new_orders, icon: ShoppingBag, color: 'bg-gold-500/20 text-gold-600' },
      ]
    : [];

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-bold text-coffee-900">Tổng quan</h1>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-coffee-100" />
          ))}
        </div>
      ) : error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {cards.map((card) => (
              <div key={card.label} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}>
                  <card.icon size={18} />
                </div>
                <p className="text-xs text-coffee-500">{card.label}</p>
                <p className="mt-1 text-xl font-bold text-coffee-900">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Đơn hàng gần đây */}
          <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-coffee-900">Đơn hàng gần đây</h2>
              <Link to="/admin/orders" className="text-sm font-medium text-coffee-700 hover:underline">
                Xem tất cả
              </Link>
            </div>

            {stats.recent_orders.length === 0 ? (
              <p className="py-6 text-center text-sm text-coffee-400">Chưa có đơn hàng nào.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-coffee-100 text-coffee-500">
                      <th className="py-2 pr-4">Mã đơn</th>
                      <th className="py-2 pr-4">Khách hàng</th>
                      <th className="py-2 pr-4">SĐT</th>
                      <th className="py-2 pr-4">Tổng tiền</th>
                      <th className="py-2 pr-4">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_orders.map((order) => (
                      <tr key={order.id} className="border-b border-coffee-50">
                        <td className="py-3 pr-4 font-medium text-coffee-900">#{order.id}</td>
                        <td className="py-3 pr-4">{order.customer_name}</td>
                        <td className="py-3 pr-4 text-coffee-500">{order.customer_phone}</td>
                        <td className="py-3 pr-4 font-medium">{formatCurrency(order.total_amount)}</td>
                        <td className="py-3 pr-4"><OrderStatusBadge status={order.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
