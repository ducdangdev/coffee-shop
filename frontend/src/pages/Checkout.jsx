import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Wallet } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ordersApi from '../api/orders.api';
import { formatCurrency } from '../utils/format';

const paymentOptions = [
  { value: 'cod', label: 'Thanh toán khi nhận hàng (COD)', icon: Wallet },
];

export default function Checkout() {
  const { items, totalAmount, clearCart } = useCart();

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    note: '',
    payment_method: 'cod',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null); // sẽ chứa order trả về từ API
  const [serverError, setServerError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validate() {
    const newErrors = {};
    if (!form.customer_name.trim()) newErrors.customer_name = 'Vui lòng nhập họ tên.';
    if (!form.customer_phone.trim()) newErrors.customer_phone = 'Vui lòng nhập số điện thoại.';
    else if (!/^[0-9]{9,11}$/.test(form.customer_phone.trim()))
      newErrors.customer_phone = 'Số điện thoại không hợp lệ.';
    if (!form.customer_address.trim()) newErrors.customer_address = 'Vui lòng nhập địa chỉ giao hàng.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setServerError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        items: items.map((item) => ({ product_id: item.id, quantity: item.quantity })),
      };
      const res = await ordersApi.create(payload);
      setSuccess(res.data);
      clearCart();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  // ============ Màn hình đặt hàng thành công ============
  if (success) {
    return (
      <div className="container-custom pt-32 pb-24 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 size={36} />
        </div>
        <h1 className="section-title mb-3">Đặt hàng thành công!</h1>
        <p className="mb-2 text-coffee-600">
          Mã đơn hàng của bạn là <span className="font-bold text-coffee-900">#{success.id}</span>
        </p>
        <p className="mb-8 text-coffee-600">
          Tổng tiền: <span className="font-bold text-coffee-900">{formatCurrency(success.total_amount)}</span>
        </p>
        <p className="mx-auto mb-8 max-w-md text-sm text-coffee-500">
          Chúng tôi sẽ liên hệ số điện thoại <strong>{success.customer_phone}</strong> để xác nhận đơn hàng sớm nhất.
        </p>
        <Link to="/menu" className="btn-primary inline-flex">Tiếp tục mua sắm</Link>
      </div>
    );
  }

  // ============ Giỏ hàng trống -> không cho vào checkout ============
  if (items.length === 0) {
    return (
      <div className="container-custom pt-32 pb-24 text-center">
        <p className="mb-6 text-coffee-600">Giỏ hàng của bạn đang trống.</p>
        <Link to="/menu" className="btn-primary inline-flex">Xem thực đơn</Link>
      </div>
    );
  }

  return (
    <div className="container-custom pt-28 pb-20">
      <h1 className="section-title mb-8">Thông tin đặt hàng</h1>

      <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-3">
        {/* Form thông tin */}
        <div className="lg:col-span-2 space-y-5 rounded-2xl bg-white p-6 shadow-card">
          <div>
            <label className="mb-1 block text-sm font-medium text-coffee-700">Họ và tên *</label>
            <input
              name="customer_name"
              value={form.customer_name}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-coffee-500 ${
                errors.customer_name ? 'border-red-400' : 'border-coffee-200'
              }`}
            />
            {errors.customer_name && <p className="mt-1 text-xs text-red-500">{errors.customer_name}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-coffee-700">Số điện thoại *</label>
            <input
              name="customer_phone"
              value={form.customer_phone}
              onChange={handleChange}
              placeholder="0901234567"
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-coffee-500 ${
                errors.customer_phone ? 'border-red-400' : 'border-coffee-200'
              }`}
            />
            {errors.customer_phone && <p className="mt-1 text-xs text-red-500">{errors.customer_phone}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-coffee-700">Địa chỉ giao hàng *</label>
            <input
              name="customer_address"
              value={form.customer_address}
              onChange={handleChange}
              placeholder="Số nhà, đường, phường/xã, quận/huyện..."
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-coffee-500 ${
                errors.customer_address ? 'border-red-400' : 'border-coffee-200'
              }`}
            />
            {errors.customer_address && <p className="mt-1 text-xs text-red-500">{errors.customer_address}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-coffee-700">Ghi chú</label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows={3}
              placeholder="Ví dụ: ít đá, giao giờ hành chính..."
              className="w-full rounded-xl border border-coffee-200 px-4 py-3 text-sm outline-none focus:border-coffee-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-coffee-700">Phương thức thanh toán</label>
            <div className="space-y-2">
              {paymentOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                    form.payment_method === opt.value
                      ? 'border-coffee-800 bg-coffee-50'
                      : 'border-coffee-200 hover:bg-coffee-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={opt.value}
                    checked={form.payment_method === opt.value}
                    onChange={handleChange}
                    className="accent-coffee-800"
                  />
                  <opt.icon size={18} className="text-coffee-600" />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Tóm tắt đơn hàng */}
        <div className="h-fit rounded-2xl bg-white p-6 shadow-card">
          <h2 className="mb-4 font-serif text-xl font-semibold text-coffee-900">Đơn hàng của bạn</h2>
          <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-coffee-700">
                  {item.name} <span className="text-coffee-400">x{item.quantity}</span>
                </span>
                <span className="font-medium text-coffee-900">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="my-4 border-t border-dashed border-coffee-200" />
          <div className="flex justify-between text-lg font-bold text-coffee-900">
            <span>Tổng cộng</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>

          {serverError && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{serverError}</p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full disabled:opacity-60">
            {submitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
          </button>
        </div>
      </form>
    </div>
  );
}
