import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency, getImageUrl } from '../utils/format';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalAmount } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container-custom pt-32 pb-24 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-coffee-100 text-coffee-400">
          <ShoppingBag size={32} />
        </div>
        <h1 className="section-title mb-3">Giỏ hàng đang trống</h1>
        <p className="mb-8 text-coffee-500">Hãy chọn vài món ngon từ thực đơn của chúng tôi nhé!</p>
        <Link to="/menu" className="btn-primary inline-flex">Xem thực đơn</Link>
      </div>
    );
  }

  return (
    <div className="container-custom pt-28 pb-20">
      <h1 className="section-title mb-8">Giỏ hàng của bạn</h1>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Danh sách món */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-nowrap"
            >
              <img
                src={getImageUrl(item.image_url)}
                alt={item.name}
                className="h-20 w-20 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1 basis-1/2 sm:basis-auto">
                <h3 className="font-serif font-semibold text-coffee-900">{item.name}</h3>
                <p className="text-sm text-coffee-500">{formatCurrency(item.price)}</p>
              </div>

              <div className="flex items-center rounded-full border border-coffee-200">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="flex h-8 w-8 items-center justify-center text-coffee-700 hover:text-coffee-900"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center text-coffee-700 hover:text-coffee-900"
                >
                  <Plus size={14} />
                </button>
              </div>

              <p className="w-28 text-right font-semibold text-coffee-800">
                {formatCurrency(item.price * item.quantity)}
              </p>

              <button
                onClick={() => removeFromCart(item.id)}
                className="text-coffee-400 hover:text-red-500"
                aria-label="Xóa món"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Tổng tiền */}
        <div className="h-fit rounded-2xl bg-white p-6 shadow-card">
          <h2 className="mb-4 font-serif text-xl font-semibold text-coffee-900">Tóm tắt đơn hàng</h2>
          <div className="flex justify-between text-sm text-coffee-600">
            <span>Tạm tính</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
          <div className="my-4 border-t border-dashed border-coffee-200" />
          <div className="flex justify-between text-lg font-bold text-coffee-900">
            <span>Tổng cộng</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
          <button onClick={() => navigate('/checkout')} className="btn-primary mt-6 w-full">
            Tiến hành đặt hàng
          </button>
          <Link to="/menu" className="mt-3 block text-center text-sm text-coffee-500 hover:underline">
            Tiếp tục chọn món
          </Link>
        </div>
      </div>
    </div>
  );
}
