import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardApi } from '../../api/auth.api';
import { formatCurrency } from '../../utils/format';

export default function AdminReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState({ from: '', to: '' });

  function loadReport(selectedRange = range) {
    setLoading(true);
    setError('');
    const params = {};
    if (selectedRange.from && selectedRange.to) {
      params.from = selectedRange.from;
      params.to = selectedRange.to;
    }
    dashboardApi
      .getReport(params)
      .then((res) => setReport(res.data))
      .catch(() => setError('Không thể tải báo cáo. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }

  useEffect(loadReport, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleFilterSubmit(e) {
    e.preventDefault();
    loadReport();
  }

  const chartData = report?.revenue_by_day.map((d) => ({
    date: new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    'Doanh thu': Number(d.revenue),
  })) || [];

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-bold text-coffee-900">Báo cáo doanh thu</h1>

      {/* Bộ lọc theo ngày */}
      <form onSubmit={handleFilterSubmit} className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-coffee-600">Từ ngày</label>
          <input
            type="date"
            value={range.from}
            onChange={(e) => setRange({ ...range, from: e.target.value })}
            className="rounded-xl border border-coffee-200 px-3 py-2 text-sm outline-none focus:border-coffee-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-coffee-600">Đến ngày</label>
          <input
            type="date"
            value={range.to}
            onChange={(e) => setRange({ ...range, to: e.target.value })}
            className="rounded-xl border border-coffee-200 px-3 py-2 text-sm outline-none focus:border-coffee-500"
          />
        </div>
        <button type="submit" className="btn-primary text-sm">Lọc</button>
        {(range.from || range.to) && (
          <button
            type="button"
            onClick={() => { const empty = { from: '', to: '' }; setRange(empty); loadReport(empty); }}
            className="text-sm text-coffee-500 hover:underline"
          >
            Xóa lọc
          </button>
        )}
      </form>

      {error ? <p role="alert" className="text-red-600">{error}</p> : loading || !report ? (
        <p className="text-coffee-400">Đang tải báo cáo...</p>
      ) : (
        <>
          {/* Tổng quan */}
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs text-coffee-500">Doanh thu (đơn hoàn thành)</p>
              <p className="mt-1 text-2xl font-bold text-coffee-900">{formatCurrency(report.summary.revenue)}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs text-coffee-500">Số đơn hoàn thành</p>
              <p className="mt-1 text-2xl font-bold text-coffee-900">{report.summary.order_count}</p>
            </div>
          </div>

          {/* Biểu đồ doanh thu theo ngày */}
          <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-serif text-lg font-semibold text-coffee-900">Doanh thu theo ngày</h2>
            {chartData.length === 0 ? (
              <p className="py-10 text-center text-sm text-coffee-400">Chưa có dữ liệu doanh thu.</p>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="Doanh thu" fill="#835436" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Món bán chạy */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-serif text-lg font-semibold text-coffee-900">Món bán chạy nhất</h2>
            {report.top_products.length === 0 ? (
              <p className="py-6 text-center text-sm text-coffee-400">Chưa có dữ liệu.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-coffee-100 text-coffee-500">
                    <th className="py-2 pr-4">Món</th>
                    <th className="py-2 pr-4">Số lượng bán</th>
                    <th className="py-2 pr-4">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {report.top_products.map((p) => (
                    <tr key={p.product_id} className="border-b border-coffee-50">
                      <td className="py-3 pr-4 font-medium text-coffee-900">{p.product_name}</td>
                      <td className="py-3 pr-4">{p.total_sold}</td>
                      <td className="py-3 pr-4 font-medium">{formatCurrency(p.total_revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
