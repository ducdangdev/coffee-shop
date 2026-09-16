import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import ordersApi from '../../api/orders.api';
import { formatCurrency } from '../../utils/format';
import OrderStatusBadge, { statusConfig } from '../../components/admin/OrderStatusBadge';

const statusFilters = [
  { value: '', label: 'Tất cả' },
  ...Object.entries(statusConfig).map(([value, cfg]) => ({ value, label: cfg.label })),
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  function loadOrders() {
    setLoading(true);
    setError('');
    const params = {};
    if (statusFilter) params.status = statusFilter;
    ordersApi
      .getAll(params)
      .then((res) => setOrders(res.data))
      .catch(() => setError('Không thể tải đơn hàng. Vui lòng tải lại trang.'))
      .finally(() => setLoading(false));
  }

  useEffect(loadOrders, [statusFilter]);

  async function openDetail(order) {
    try {
      const res = await ordersApi.getById(order.id);
      setSelectedOrder(res.data);
    } catch { setError('Không thể tải chi tiết đơn hàng.'); }
  }

  async function handleStatusChange(orderId, newStatus) {
    setUpdating(true);
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể cập nhật trạng thái.');
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-bold text-coffee-900">Quản lý đơn hàng</h1>
      {error && <p role="alert" className="mb-4 text-red-600">{error}</p>}

      {/* Bộ lọc trạng thái */}
      <div className="mb-5 flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === f.value ? 'bg-coffee-800 text-cream-50' : 'bg-coffee-100 text-coffee-700 hover:bg-coffee-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-coffee-100 text-coffee-500">
              <th className="px-5 py-3">Mã đơn</th>
              <th className="px-5 py-3">Khách hàng</th>
              <th className="px-5 py-3">SĐT</th>
              <th className="px-5 py-3">Tổng tiền</th>
              <th className="px-5 py-3">Ngày đặt</th>
              <th className="px-5 py-3">Trạng thái</th>
              <th className="px-5 py-3 text-right">Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-coffee-400">Đang tải...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-coffee-400">Chưa có đơn hàng nào.</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-coffee-50">
                  <td className="px-5 py-3 font-medium text-coffee-900">#{order.id}</td>
                  <td className="px-5 py-3">{order.customer_name}</td>
                  <td className="px-5 py-3 text-coffee-500">{order.customer_phone}</td>
                  <td className="px-5 py-3 font-medium">{formatCurrency(order.total_amount)}</td>
                  <td className="px-5 py-3 text-coffee-500">
                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-5 py-3"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => openDetail(order)} className="text-sm font-medium text-coffee-700 hover:underline">
                      Xem
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal chi tiết đơn hàng */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-8">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-coffee-900">Đơn hàng #{selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-coffee-400 hover:text-coffee-700">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-1 text-sm text-coffee-700">
              <p><span className="font-medium">Khách hàng:</span> {selectedOrder.customer_name}</p>
              <p><span className="font-medium">SĐT:</span> {selectedOrder.customer_phone}</p>
              <p><span className="font-medium">Địa chỉ:</span> {selectedOrder.customer_address}</p>
              {selectedOrder.note && <p><span className="font-medium">Ghi chú:</span> {selectedOrder.note}</p>}
              <p><span className="font-medium">Thanh toán:</span> {selectedOrder.payment_method}</p>
            </div>

            <div className="my-4 border-t border-dashed border-coffee-200" />

            <div className="space-y-2">
              {selectedOrder.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-coffee-700">{item.product_name} x{item.quantity}</span>
                  <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="my-4 border-t border-dashed border-coffee-200" />

            <div className="flex justify-between text-base font-bold text-coffee-900">
              <span>Tổng cộng</span>
              <span>{formatCurrency(selectedOrder.total_amount)}</span>
            </div>

            <div className="mt-5">
              <label className="mb-1 block text-sm font-medium text-coffee-700">Cập nhật trạng thái</label>
              <select
                value={selectedOrder.status}
                disabled={updating}
                onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                className="w-full rounded-xl border border-coffee-200 px-3 py-2.5 text-sm outline-none focus:border-coffee-500"
              >
                {Object.entries(statusConfig).map(([value, cfg]) => (
                  <option key={value} value={value}>{cfg.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
