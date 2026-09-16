export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount || 0);
}

export function getImageUrl(path) {
  if (!path) return 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600';
  if (path.startsWith('http')) return path;
  const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/api\/?$/, '');
  return `${base}${path}`;
}
