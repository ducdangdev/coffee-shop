import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Coffee, Leaf, Star, Users } from 'lucide-react';
import productsApi from '../api/products.api';
import categoriesApi from '../api/categories.api';
import ProductCard from '../components/ProductCard';

const spaceImages = [
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
  'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800',
  'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800',
];

const testimonials = [
  {
    name: 'Minh Anh',
    text: 'Không gian yên tĩnh, cà phê đậm vị. Mình hay ghé đây làm việc mỗi sáng cuối tuần.',
    rating: 5,
  },
  {
    name: 'Gia Bảo',
    text: 'Trà sữa trân châu ở đây ngon nhất khu vực, trân châu dẻo và không quá ngọt.',
    rating: 5,
  },
  {
    name: 'Thanh Hà',
    text: 'Nhân viên thân thiện, đặt hàng online giao nhanh, đúng giờ. Rất hài lòng!',
    rating: 4,
  },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productsApi.getAll({ featured: 'true' }),
          categoriesApi.getAll(),
        ]);
        setFeatured(productsRes.data.slice(0, 4));
        setCategories(categoriesRes.data);
      } catch (error) {
        setError('Chưa tải được thực đơn. Vui lòng tải lại trang hoặc thử lại sau.');
        console.error('Lỗi tải dữ liệu trang chủ:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      {/* ============ BANNER ============ */}
      <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-coffee-950">
        <img
          src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600"
          alt="Không gian quán cà phê"
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-coffee-950 via-coffee-950/60 to-coffee-950/20" />

        <div className="container-custom relative z-10 text-center text-cream-50">
          <p className="mb-4 inline-block rounded-full border border-gold-400/50 px-4 py-1 text-sm tracking-widest text-gold-400">
            CHÀO MỪNG ĐẾN VỚI
          </p>
          <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight">
            Ô Cà Phê
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-cream-100/80">
            Hương vị nguyên bản từ những hạt cà phê chọn lọc, pha chế thủ công trong một không gian
            ấm áp và tinh tế.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/menu" className="btn-primary bg-gold-500 hover:bg-gold-600">
              Xem thực đơn <ArrowRight size={16} />
            </Link>
            <Link to="/about" className="btn-outline border-cream-50 text-cream-50 hover:bg-cream-50 hover:text-coffee-900">
              Về chúng tôi
            </Link>
          </div>
        </div>
      </section>

      {/* ============ GIỚI THIỆU NGẮN ============ */}
      <section className="py-20">
        <div className="container-custom grid items-center gap-12 md:grid-cols-2">
          <img
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900"
            alt="Pha chế cà phê"
            className="rounded-3xl shadow-card"
          />
          <div>
            <p className="mb-3 font-semibold uppercase tracking-widest text-gold-600">Câu chuyện của chúng tôi</p>
            <h2 className="section-title mb-5">Nơi mỗi tách cà phê là một câu chuyện</h2>
            <p className="mb-6 leading-relaxed text-coffee-700">
              Ra đời từ niềm đam mê với cà phê Việt, chúng tôi chọn lọc từng hạt cà phê từ vùng
              nguyên liệu Tây Nguyên, rang xay thủ công để giữ trọn hương vị. Mỗi sản phẩm là sự
              kết hợp giữa truyền thống và sự tinh tế hiện đại.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Coffee, label: 'Cà phê nguyên chất' },
                { icon: Leaf, label: 'Nguyên liệu tươi sạch' },
                { icon: Users, label: 'Phục vụ tận tâm' },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-coffee-100 text-coffee-700">
                    <item.icon size={20} />
                  </div>
                  <p className="text-xs font-medium text-coffee-600">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ MÓN NỔI BẬT ============ */}
      <section className="bg-coffee-50 py-20">
        <div className="container-custom">
          <div className="mb-10 text-center">
            <p className="mb-3 font-semibold uppercase tracking-widest text-gold-600">Đặc trưng của quán</p>
            <h2 className="section-title">Món nổi bật</h2>
          </div>

          {error && <p role="alert" className="mb-4 text-center text-red-600">{error}</p>}
          {loading ? (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-2xl bg-coffee-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link to="/menu" className="btn-outline">
              Xem toàn bộ thực đơn <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ DANH MỤC ĐỒ UỐNG ============ */}
      <section className="py-20">
        <div className="container-custom">
          <div className="mb-10 text-center">
            <p className="mb-3 font-semibold uppercase tracking-widest text-gold-600">Thực đơn đa dạng</p>
            <h2 className="section-title">Danh mục đồ uống</h2>
          </div>

          <div className="flex gap-4 overflow-x-auto scrollbar-hide md:grid md:grid-cols-5 md:overflow-visible">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/menu?category=${cat.id}`}
                className="group min-w-[140px] flex-1 rounded-2xl border border-coffee-100 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-card"
              >
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-coffee-800 text-cream-50 transition-colors group-hover:bg-gold-500">
                  <Coffee size={22} />
                </div>
                <p className="font-serif font-semibold text-coffee-900">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ KHÔNG GIAN QUÁN ============ */}
      <section className="bg-coffee-950 py-20 text-cream-50">
        <div className="container-custom">
          <div className="mb-10 text-center">
            <p className="mb-3 font-semibold uppercase tracking-widest text-gold-400">Ghé thăm chúng tôi</p>
            <h2 className="section-title text-cream-50">Không gian quán</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {spaceImages.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Không gian quán ${i + 1}`}
                className="h-56 w-full rounded-2xl object-cover transition-transform duration-300 hover:scale-105"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ============ ĐÁNH GIÁ KHÁCH HÀNG ============ */}
      <section className="py-20">
        <div className="container-custom">
          <div className="mb-10 text-center">
            <p className="mb-3 font-semibold uppercase tracking-widest text-gold-600">Khách hàng nói gì</p>
            <h2 className="section-title">Đánh giá từ khách hàng</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="card p-6">
                <div className="mb-3 flex gap-1 text-gold-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < t.rating ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <p className="mb-4 text-sm italic text-coffee-700">"{t.text}"</p>
                <p className="font-semibold text-coffee-900">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
