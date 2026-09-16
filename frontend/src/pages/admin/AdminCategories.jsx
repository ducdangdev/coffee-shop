import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import categoriesApi from '../../api/categories.api';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // category đang sửa, null = thêm mới
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');

  function loadCategories() {
    setLoading(true);
    setLoadError('');
    categoriesApi
      .getAll()
      .then((res) => setCategories(res.data))
      .catch(() => setLoadError('Không thể tải danh mục. Vui lòng tải lại trang.'))
      .finally(() => setLoading(false));
  }

  useEffect(loadCategories, []);

  function openAddModal() {
    setEditing(null);
    setForm({ name: '', description: '' });
    setError('');
    setModalOpen(true);
  }

  function openEditModal(cat) {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || '' });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editing) {
        await categoriesApi.update(editing.id, form);
      } else {
        await categoriesApi.create(form);
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(cat) {
    if (!confirm(`Xóa danh mục "${cat.name}"?`)) return;
    try {
      await categoriesApi.remove(cat.id);
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xóa danh mục.');
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-3 items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-coffee-900">Quản lý danh mục</h1>
        <button onClick={openAddModal} className="btn-primary text-sm">
          <Plus size={16} /> Thêm danh mục
        </button>
      </div>

      {loadError && <p role="alert" className="mb-4 text-red-600">{loadError}</p>}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-coffee-100 text-coffee-500">
              <th className="px-5 py-3">Tên danh mục</th>
              <th className="px-5 py-3">Mô tả</th>
              <th className="px-5 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="px-5 py-8 text-center text-coffee-400">Đang tải...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={3} className="px-5 py-8 text-center text-coffee-400">Chưa có danh mục nào.</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="border-b border-coffee-50">
                  <td className="px-5 py-3 font-medium text-coffee-900">{cat.name}</td>
                  <td className="px-5 py-3 text-coffee-500">{cat.description || '—'}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditModal(cat)} className="rounded-lg p-2 text-coffee-600 hover:bg-coffee-50">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(cat)} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
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

      {/* Modal thêm/sửa */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-coffee-900">
                {editing ? 'Sửa danh mục' : 'Thêm danh mục'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-coffee-400 hover:text-coffee-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-coffee-700">Tên danh mục *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full rounded-xl border border-coffee-200 px-4 py-2.5 text-sm outline-none focus:border-coffee-500"
                />
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
