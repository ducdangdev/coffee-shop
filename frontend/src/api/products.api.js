import axiosClient from './axiosClient';

const productsApi = {
  // Lấy danh sách sản phẩm, hỗ trợ filter: { search, category, featured }
  getAll: (params = {}) => axiosClient.get('/products', { params }),

  getById: (id) => axiosClient.get(`/products/${id}`),

  // Admin - tạo sản phẩm mới (formData vì có thể kèm ảnh)
  create: (formData) =>
    axiosClient.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id, formData) =>
    axiosClient.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  remove: (id) => axiosClient.delete(`/products/${id}`),
};

export default productsApi;
