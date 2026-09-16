import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import productsApi from '../api/products.api';
import categoriesApi from '../api/categories.api';
import ProductCard from '../components/ProductCard';

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tải danh mục 1 lần
  useEffect(() => {
    categoriesApi.getAll().then((res) => setCategories(res.data)).catch(console.error);
  }, []);

  // Tải sản phẩm mỗi khi filter thay đổi (đọc thẳng từ URL để có thể chia sẻ link)
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const params = {};
    if (activeCategory) params.category = activeCategory;
    const search = searchParams.get('search');
    if (search) params.search = search;

    productsApi
      .getAll(params)
      .then((res) => { if (active) setProducts(res.data); })
      .catch(() => { if (active) setError('Không thể tải thực đơn. Vui lòng thử lại sau.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [activeCategory, searchParams]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) next.set('search', searchInput.trim());
    else next.delete('search');
    setSearchParams(next);
  }

  function handleCategoryClick(catId) {
    const next = new URLSearchParams(searchParams);
    if (catId === activeCategory) next.delete('category');
    else next.set('category', catId);
    setSearchParams(next);
  }

  function clearFilters() {
    setSearchInput('');
    setSearchParams({});
  }

  const hasFilters = activeCategory || searchParams.get('search');

  const activeCategoryName = useMemo(
    () => categories.find((c) => String(c.id) === activeCategory)?.name,
    [categories, activeCategory]
  );

  return (
    <div className="pt-28 pb-20">
      {/* Header trang */}
      <div className="bg-coffee-950 py-14 text-center text-cream-50">
        <div className="container-custom">
          <p className="mb-2 font-semibold uppercase tracking-widest text-gold-400">Thực đơn</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold">Khám phá hương vị của chúng tôi</h1>
        </div>
      </div>

      <div className="container-custom mt-10">
        {/* Thanh tìm kiếm */}
        <form onSubmit={handleSearchSubmit} className="mx-auto mb-8 flex max-w-xl gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-400" size={18} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm món bạn thích..."
              className="w-full rounded-full border border-coffee-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-coffee-500"
            />
          </div>
          <button type="submit" className="btn-primary">Tìm</button>
        </form>

        {/* Lọc danh mục */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => handleCategoryClick('')}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              !activeCategory ? 'bg-coffee-800 text-cream-50' : 'bg-coffee-100 text-coffee-700 hover:bg-coffee-200'
            }`}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(String(cat.id))}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                activeCategory === String(cat.id)
                  ? 'bg-coffee-800 text-cream-50'
                  : 'bg-coffee-100 text-coffee-700 hover:bg-coffee-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Chip filter đang áp dụng */}
        {hasFilters && (
          <div className="mb-6 flex items-center justify-center gap-2 text-sm text-coffee-600">
            <span>
              Đang lọc: {activeCategoryName ? `"${activeCategoryName}"` : ''}
              {searchParams.get('search') ? ` • Tìm kiếm: "${searchParams.get('search')}"` : ''}
            </span>
            <button onClick={clearFilters} className="flex items-center gap-1 font-medium text-coffee-800 hover:underline">
              <X size={14} /> Xóa lọc
            </button>
          </div>
        )}

        {/* Danh sách sản phẩm */}
        {error ? <p role="alert" className="py-10 text-center text-red-600">{error}</p> : loading ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-coffee-100" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-coffee-500">
            Không tìm thấy món nào phù hợp. Thử từ khóa khác nhé!
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
