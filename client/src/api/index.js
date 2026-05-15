import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getBySlug: (slug) => api.get(`/products/${slug}`),
  getFeatured: (limit) => api.get('/products/featured', { params: { limit } }),
  getByCategory: (slug, params) => api.get(`/products/category/${slug}`, { params }),
  getRelated: (id, limit) => api.get(`/products/related/${id}`, { params: { limit } }),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getWithProducts: () => api.get('/categories/with-products'),
  getBySlug: (slug) => api.get(`/categories/${slug}`),
};

export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getByNumber: (orderNumber) => api.get(`/orders/number/${orderNumber}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
};

export const addressesAPI = {
  getAll: () => api.get('/users/addresses'),
  create: (data) => api.post('/users/addresses', data),
  update: (id, data) => api.put(`/users/addresses/${id}`, data),
  delete: (id) => api.delete(`/users/addresses/${id}`),
  setDefault: (id) => api.put(`/users/addresses/${id}/default`),
};

export const adminProductsAPI = {
  getAll: (params) => api.get('/admin/products', { params }),
  create: (data) => api.post('/admin/products', data),
  update: (id, data) => api.put(`/admin/products/${id}`, data),
  delete: (id) => api.delete(`/admin/products/${id}`),
  toggleActive: (id) => api.put(`/admin/products/${id}/toggle-active`),
  toggleFeatured: (id) => api.put(`/admin/products/${id}/toggle-featured`),
};

export const adminCategoriesAPI = {
  getAll: () => api.get('/admin/categories'),
  create: (data) => api.post('/admin/categories', data),
  update: (id, data) => api.put(`/admin/categories/${id}`, data),
  delete: (id) => api.delete(`/admin/categories/${id}`),
};

export const adminOrdersAPI = {
  getAll: (params) => api.get('/admin/orders', { params }),
  getById: (id) => api.get(`/admin/orders/${id}`),
  updateStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
  getStats: () => api.get('/admin/orders/stats'),
  getChart: (days) => api.get('/admin/orders/chart', { params: { days } }),
};

export const dashboardAPI = {
  getData: () => api.get('/admin/dashboard'),
  getOrdersChart: (days) => api.get('/admin/dashboard/orders-chart', { params: { days } }),
  getRevenueChart: (days) => api.get('/admin/dashboard/revenue-chart', { params: { days } }),
};

export const uploadAPI = {
  uploadImage: (formData) => api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadImages: (formData) => api.post('/upload/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const reviewsAPI = {
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  create: (data) => api.post('/reviews', data),
};

export const myOrdersAPI = {
  getAll: () => api.get('/my-orders'),
  getById: (id) => api.get(`/my-orders/${id}`),
  cancel: (id, data) => api.put(`/my-orders/${id}/cancel`, data),
};

export default api;