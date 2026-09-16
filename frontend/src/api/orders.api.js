import axiosClient from './axiosClient';

const ordersApi = {
  // Khách đặt hàng
  create: (data) => axiosClient.post('/orders', data),

  // Admin
  getAll: (params = {}) => axiosClient.get('/orders', { params }),
  getById: (id) => axiosClient.get(`/orders/${id}`),
  updateStatus: (id, status) => axiosClient.put(`/orders/${id}/status`, { status }),
};

export default ordersApi;
