import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { formatCurrency, getImageUrl } from '../utils/format';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  function handleAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    if (product.is_available) addToCart(product, 1);
  }

  return (
    <Link to={`/product/${product.id}`} className="card group block">
      <div className="relative h-52 overflow-hidden">
        <img
          src={getImageUrl(product.image_url)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {product.is_featured === 1 && (
          <span className="absolute top-3 left-3 rounded-full bg-gold-500 px-3 py-1 text-xs font-semibold text-white shadow">
            Nổi bật
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-coffee-400 mb-1">{product.category_name}</p>
        <h3 className="font-serif text-lg font-semibold text-coffee-900 line-clamp-1">{product.name}</h3>
        <p className="mt-1 text-sm text-coffee-600 line-clamp-2 min-h-[2.5rem]">{product.description}</p>
        {!product.is_available && <p className="text-xs text-red-600">Tạm ngừng bán</p>}
        <div className="mt-3 flex flex-wrap gap-2 items-center justify-between">
          <span className="text-base sm:text-lg font-bold text-coffee-800">{formatCurrency(product.price)}</span>
          <button
            disabled={!product.is_available}
            onClick={handleAdd}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-coffee-800 text-cream-50 transition-transform hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Thêm vào giỏ"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </Link>
  );
}
