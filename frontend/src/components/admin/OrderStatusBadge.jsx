const statusConfig = {
  pending: { label: 'Chờ xác nhận', className: 'bg-amber-100 text-amber-700' },
  preparing: { label: 'Đang chuẩn bị', className: 'bg-blue-100 text-blue-700' },
  delivering: { label: 'Đang giao', className: 'bg-purple-100 text-purple-700' },
  completed: { label: 'Hoàn thành', className: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-700' },
};

export default function OrderStatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, className: 'bg-coffee-100 text-coffee-700' };
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}

export { statusConfig };
