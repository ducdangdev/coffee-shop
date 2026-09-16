import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingBag } from 'lucide-react';
import productsApi from '../api/products.api';
import { useCart } from '../context/CartContext';
import { formatCurrency, getImageUrl } from '../utils/format';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setAdded(false);
    setQuantity(1);
    productsApi
      .getById(id)
      .then((res) => setProduct(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  function handleAddToCart() {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    addToCart(product, quantity);
    navigate('/cart');
  }

  if (loading) {
    return (
      <div className="container-custom pt-32 pb-20">
        <div className="grid animate-pulse gap-10 md:grid-cols-2">
          <div className="h-96 rounded-3xl bg-coffee-100" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 rounded bg-coffee-100" />
            <div className="h-4 w-1/3 rounded bg-coffee-100" />
            <div className="h-20 rounded bg-coffee-100" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="container-custom pt-32 pb-20 text-center">
        <p className="text-coffee-600">Không tìm thấy sản phẩm này.</p>
        <Link to="/menu" className="btn-primary mt-6 inline-flex">Quay lại thực đơn</Link>
      </div>
    );
  }

  return (
    <div className="container-custom pt-28 pb-20">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-coffee-600 hover:text-coffee-900"
      >
        <ArrowLeft size={16} /> Quay lại
      </button>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl shadow-card">
          <img
            src={getImageUrl(product.image_url)}
            alt={product.name}
            className="h-full w-full max-h-[480px] object-cover"
          />
        </div>

        <div>
          <p className="mb-2 text-sm uppercase tracking-wide text-coffee-400">{product.category_name}</p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-coffee-900">{product.name}</h1>
          <p className="mt-4 text-2xl font-bold text-coffee-800">{formatCurrency(product.price)}</p>
          <p className="mt-5 leading-relaxed text-coffee-600">{product.description}</p>

          {!product.is_available && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
              Món này hiện đã tạm ngừng bán.
            </p>
          )}

          {/* Số lượng */}
          <div className="mt-8 flex items-center gap-4">
            <span className="text-sm font-medium text-coffee-700">Số lượng</span>
            <div className="flex items-center rounded-full border border-coffee-200">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center text-coffee-700 hover:text-coffee-900"
              >
                <Minus size={16} />
              </button>
              <span className="w-10 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                className="flex h-10 w-10 items-center justify-center text-coffee-700 hover:text-coffee-900"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={handleAddToCart}
              disabled={!product.is_available}
              className="btn-outline disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingBag size={18} /> {added ? 'Đã thêm vào giỏ ✓' : 'Thêm vào giỏ'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!product.is_available}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
