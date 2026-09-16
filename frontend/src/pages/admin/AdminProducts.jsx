import { useEffect, useState } from 'react';
import { ImagePlus, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import productsApi from '../../api/products.api';
import categoriesApi from '../../api/categories.api';
import { formatCurrency, getImageUrl } from '../../utils/format';

const emptyForm = {
  category_id: '',
  name: '',
  description: '',
  price: '',
  is_featured: false,
  is_available: true,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');

  function loadProducts() {
    setLoading(true);
    setLoadError('');
    const params = {};
    if (search) params.search = search;
    if (categoryFilter) params.category = categoryFilter;
    productsApi
      .getAll(params)
      .then((res) => setProducts(res.data))
      .catch(() => setLoadError('Không thể tải sản phẩm. Vui lòng tải lại trang.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    categoriesApi.getAll().then((res) => setCategories(res.data)).catch(() => setLoadError('Không thể tải danh mục.'));
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadProducts, 300); // debounce khi gõ tìm kiếm
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryFilter]);

  function openAddModal() {
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview('');
    setError('');
    setModalOpen(true);
  }

  function openEditModal(product) {
    setEditing(product);
    setForm({
      category_id: product.category_id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      is_featured: !!product.is_featured,
      is_available: !!product.is_available,
    });
    setImageFile(null);
    setImagePreview(getImageUrl(product.image_url));
    setError('');
    setModalOpen(true);
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('category_id', form.category_id);
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('is_featured', form.is_featured);
      formData.append('is_available', form.is_available);
      if (imageFile) formData.append('image', imageFile);

      if (editing) {
        await productsApi.update(editing.id, formData);
      } else {
        await productsApi.create(formData);
      }
      setModalOpen(false);
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(product) {
    if (!confirm(`Xóa món "${product.name}"?`)) return;
    try {
      await productsApi.remove(product.id);
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xóa món này.');
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-bold text-coffee-900">Quản lý món</h1>
        <button onClick={openAddModal} className="btn-primary text-sm">
          <Plus size={16} /> Thêm món
        </button>
      </div>

      {/* Bộ lọc */}
      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên món..."
            className="w-full rounded-xl border border-coffee-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-coffee-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-coffee-200 px-3 py-2.5 text-sm outline-none focus:border-coffee-500"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Bảng sản phẩm */}
      {loadError && <p role="alert" className="mb-4 text-red-600">{loadError}</p>}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-coffee-100 text-coffee-500">
              <th className="px-5 py-3">Món</th>
              <th className="px-5 py-3">Danh mục</th>
              <th className="px-5 py-3">Giá</th>
              <th className="px-5 py-3">Trạng thái</th>
              <th className="px-5 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-coffee-400">Đang tải...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-coffee-400">Không tìm thấy món nào.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b border-coffee-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={getImageUrl(p.image_url)} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                      <span className="font-medium text-coffee-900">{p.name}</span>
                      {p.is_featured === 1 && (
                        <span className="rounded-full bg-gold-500/20 px-2 py-0.5 text-[10px] font-semibold text-gold-600">Nổi bật</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-coffee-500">{p.category_name}</td>
                  <td className="px-5 py-3 font-medium">{formatCurrency(p.price)}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      p.is_available ? 'bg-green-100 text-green-700' : 'bg-coffee-100 text-coffee-500'
                    }`}>
                      {p.is_available ? 'Đang bán' : 'Ngừng bán'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditModal(p)} className="rounded-lg p-2 text-coffee-600 hover:bg-coffee-50">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(p)} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal thêm/sửa món */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-8">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-coffee-900">
                {editing ? 'Sửa món' : 'Thêm món mới'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-coffee-400 hover:text-coffee-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Ảnh */}
              <div>
                <label className="mb-1 block text-sm font-medium text-coffee-700">Hình ảnh</label>
                <label className="flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-coffee-200 hover:border-coffee-400">
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-coffee-400">
                      <ImagePlus size={24} />
                      <span className="mt-1 text-xs">Chọn ảnh</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-coffee-700">Tên món *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full rounded-xl border border-coffee-200 px-4 py-2.5 text-sm outline-none focus:border-coffee-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-coffee-700">Danh mục *</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    required
                    className="w-full rounded-xl border border-coffee-200 px-3 py-2.5 text-sm outline-none focus:border-coffee-500"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-coffee-700">Giá (đ) *</label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    className="w-full rounded-xl border border-coffee-200 px-4 py-2.5 text-sm outline-none focus:border-coffee-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-coffee-700">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-coffee-200 px-4 py-2.5 text-sm outline-none focus:border-coffee-500"
                />
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-coffee-700">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    className="accent-coffee-800"
                  />
                  Món nổi bật
                </label>
                <label className="flex items-center gap-2 text-sm text-coffee-700">
                  <input
                    type="checkbox"
                    checked={form.is_available}
                    onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                    className="accent-coffee-800"
                  />
                  Đang bán
                </label>
              </div>

              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

              <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
                {submitting ? 'Đang lưu...' : 'Lưu'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
