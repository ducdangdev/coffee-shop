import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getImageUrl } from '../../utils/format';

export default function ProductFormModal({ product, categories, onClose, onSubmit }) {
  const isEdit = Boolean(product);

  const [form, setForm] = useState({
    name: product?.name || '',
    category_id: product?.category_id || categories[0]?.id || '',
    price: product?.price || '',
    description: product?.description || '',
    is_featured: product?.is_featured === 1,
    is_available: product ? product.is_available === 1 : true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.category_id || !form.price) {
      setError('Vui lòng nhập đầy đủ tên, danh mục và giá.');
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('category_id', form.category_id);
    formData.append('price', form.price);
    formData.append('description', form.description);
    formData.append('is_featured', form.is_featured);
    formData.append('is_available', form.is_available);
    if (imageFile) formData.append('image', imageFile);

    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-coffee-900">
            {isEdit ? 'Sửa món' : 'Thêm món mới'}
          </h2>
          <button onClick={onClose} className="text-coffee-400 hover:text-coffee-800">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-coffee-700">Tên món *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-coffee-200 px-4 py-2.5 text-sm outline-none focus:border-coffee-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-coffee-700">Danh mục *</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="w-full rounded-xl border border-coffee-200 px-4 py-2.5 text-sm outline-none focus:border-coffee-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-coffee-700">Giá (đ) *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0"
                className="w-full rounded-xl border border-coffee-200 px-4 py-2.5 text-sm outline-none focus:border-coffee-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-coffee-700">Mô tả</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-xl border border-coffee-200 px-4 py-2.5 text-sm outline-none focus:border-coffee-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-coffee-700">Hình ảnh</label>
            {(preview || product?.image_url) && (
              <img
                src={preview || getImageUrl(product.image_url)}
                alt="preview"
                className="mb-2 h-32 w-32 rounded-xl object-cover"
              />
            )}
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full text-sm"
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-coffee-700">
              <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} />
              Món nổi bật
            </label>
            <label className="flex items-center gap-2 text-sm text-coffee-700">
              <input type="checkbox" name="is_available" checked={form.is_available} onChange={handleChange} />
              Đang bán
            </label>
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1">
              Hủy
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-60">
              {submitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm món'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
