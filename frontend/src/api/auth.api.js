import axiosClient from './axiosClient';

export const authApi = {
  login: (email, password) => axiosClient.post('/auth/login', { email, password }),
  getMe: () => axiosClient.get('/auth/me'),
};

export const dashboardApi = {
  getStats: () => axiosClient.get('/dashboard/stats'),
  getReport: (params = {}) => axiosClient.get('/dashboard/report', { params }),
};
