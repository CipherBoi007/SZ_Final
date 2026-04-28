import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Read directly from Zustand persist 'sz_auth' inside localStorage to avoid circular dependency
    const szAuthRaw = localStorage.getItem('sz_auth');
    if (szAuthRaw) {
      try {
        const parsed = JSON.parse(szAuthRaw);
        const token = parsed?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        // syntax error or corrupted localstorage
      }
    }
  }
  return config;
});

// Response interceptor — handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/auth')) {
          localStorage.removeItem('sz_auth'); // Hard clear the Zustand store
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth ────────────────────────────────────────
export const authAPI = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email?: string; phone?: string; password: string }) =>
    api.post('/auth/login', data),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, data: { password: string }) =>
    api.post(`/auth/reset-password/${token}`, data),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/auth/update-password', data),
  logout: () =>
    api.post('/auth/logout'),
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh-token', { refreshToken }),
  sendOTP: (data: { email?: string; phone?: string }) =>
    api.post('/auth/send-otp', data),
  sendSignupOTP: (data: { email?: string; phone?: string }) =>
    api.post('/auth/send-signup-otp', data),
  verifyOTP: (data: { email?: string; phone?: string; otp: string }) =>
    api.post('/auth/verify-otp', data),
};

// ─── Products ────────────────────────────────────
export const productAPI = {
  getAll: (params?: Record<string, string | number>) =>
    api.get('/products', { params }),
  getById: (id: string) =>
    api.get(`/products/${id}`),
  getFeatured: () =>
    api.get('/products/featured'),
  getNewArrivals: () =>
    api.get('/products/new-arrivals'),
  getTrending: () =>
    api.get('/products/trending'),
  search: (query: string) =>
    api.get('/products/search', { params: { q: query } }),
  getByCategory: (categoryId: string) =>
    api.get(`/products/category/${categoryId}`),
  getReviews: (id: string) =>
    api.get(`/products/${id}/reviews`),
  addReview: (id: string, data: { rating: number; title?: string; comment: string }) =>
    api.post(`/products/${id}/reviews`, data),
};

// ─── Cart ────────────────────────────────────────
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data: { variantId: string; quantity: number }) =>
    api.post('/cart', data),
  update: (id: string, data: { quantity: number }) =>
    api.patch(`/cart/${id}`, data),
  remove: (id: string) =>
    api.delete(`/cart/${id}`),
  clear: () => api.delete('/cart'),
};

// ─── Orders ──────────────────────────────────────
export const orderAPI = {
  create: (data: Record<string, unknown>) =>
    api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (id: string) =>
    api.get(`/orders/${id}`),
  cancel: (id: string, reason?: string) =>
    api.post(`/orders/${id}/cancel`, { reason }),
  track: (id: string) =>
    api.get(`/orders/${id}/track`),
  verifyPayment: (data: Record<string, string>) =>
    api.post('/orders/verify-payment', data),
  reorder: (id: string) =>
    api.post(`/orders/${id}/reorder`),
  getInvoice: (id: string) =>
    api.get(`/orders/${id}/invoice`),
  requestReturn: (id: string, data: Record<string, string>) =>
    api.post(`/orders/${id}/return`, data),
};

// ─── User ────────────────────────────────────────
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: Record<string, string>) =>
    api.patch('/users/profile', data),
  uploadProfilePicture: (formData: FormData) =>
    api.post('/users/profile/picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteProfilePicture: () =>
    api.delete('/users/profile/picture'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/users/change-password', data),
  deactivateAccount: () =>
    api.post('/users/deactivate'),
  getMyOrders: () => api.get('/users/orders'),
  getOrder: (id: string) => api.get(`/users/orders/${id}`),
  cancelOrder: (id: string) => api.post(`/users/orders/${id}/cancel`),
  getWishlist: () => api.get('/users/wishlist'),
  getReviews: () => api.get('/users/reviews'),
  getStats: () => api.get('/users/stats'),
};

// ─── Addresses ───────────────────────────────────
export const addressAPI = {
  getAll: () => api.get('/addresses'),
  getDefaults: () => api.get('/addresses/defaults'),
  create: (data: Record<string, string | boolean>) =>
    api.post('/addresses', data),
  getById: (id: string) => api.get(`/addresses/${id}`),
  update: (id: string, data: Record<string, string | boolean>) =>
    api.patch(`/addresses/${id}`, data),
  delete: (id: string) =>
    api.delete(`/addresses/${id}`),
  setDefault: (id: string) =>
    api.patch(`/addresses/${id}/default`),
  validatePincode: (pincode: string) =>
    api.get(`/addresses/validate-pincode/${pincode}`),
  getPincodeDetails: (pincode: string) =>
    api.get(`/addresses/pincode/${pincode}`),
};

// ─── Wishlist ────────────────────────────────────
export const wishlistAPI = {
  getAll: () => api.get('/wishlist'),
  add: (productId: string) => api.post(`/wishlist/product/${productId}`),
  remove: (id: string) => api.delete(`/wishlist/item/${id}`),
  checkStatus: (productId: string) => api.get(`/wishlist/product/${productId}/status`),
  moveToCart: (id: string, variantId: string) => api.post(`/wishlist/item/${id}/move-to-cart`, { variantId }),
  getCount: () => api.get('/wishlist/count'),
  clear: () => api.delete('/wishlist/clear'),
};

// ─── Coupons ─────────────────────────────────────
export const couponAPI = {
  validate: (code: string, orderAmount?: number) =>
    api.get(`/coupons/validate/${code}`, { params: orderAmount ? { orderAmount } : undefined }),
  getAll: () => api.get('/coupons'),
  getById: (id: string) => api.get(`/coupons/${id}`),
};

// ─── WhatsApp ────────────────────────────────────
export const whatsappAPI = {
  sendOTP: (phone: string, purpose?: string) =>
    api.post('/whatsapp/send-otp', { phone, purpose }),
  verifyOTP: (phone: string, otp: string, purpose?: string) =>
    api.post('/whatsapp/verify-otp', { phone, otp, purpose }),
  getStatus: () =>
    api.get('/whatsapp/status'),
};

export const paymentAPI = {
  createOrder: (data: { amount: number; receipt?: string }) =>
    api.post('/payment/create-order', data),
  verifyPayment: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    api.post('/payment/verify-payment', data),
};

export const configAPI = {
  getCategories: () => api.get('/config/categories'),
};

// ─── Admin ───────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  // Users
  getUsers: () => api.get('/admin/users'),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  updateUser: (id: string, data: Record<string, unknown>) => api.patch(`/admin/users/${id}`, data),
  promoteUser: (id: string) => api.post(`/admin/users/${id}/promote`),
  deactivateUser: (id: string) => api.post(`/admin/users/${id}/deactivate`),

  // Orders
  getOrders: () => api.get('/admin/orders'),
  updateOrderStatus: (id: string, data: Record<string, string>) =>
    api.patch(`/admin/orders/${id}/status`, data),
  updateOrderDeliveryDate: (id: string, data: { deliveryDate: string }) =>
    api.patch(`/admin/orders/${id}/delivery-date`, data),
  // Products (admin uses the product routes which are admin-restricted)
  createProduct: (data: FormData | Record<string, unknown>) =>
    api.post('/products', data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}),
  updateProduct: (id: string, data: FormData | Record<string, unknown>) =>
    api.patch(`/products/${id}`, data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  updateStock: (id: string, stock: number) => api.patch(`/products/${id}/stock`, { stock }),
  // Categories
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data: Record<string, string>) => api.post('/admin/categories', data),
  updateCategory: (id: string, data: Record<string, string>) => api.patch(`/admin/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),
  // Coupons
  getCoupons: () => api.get('/coupons'),
  createCoupon: (data: Record<string, unknown>) => api.post('/coupons', data),
  updateCoupon: (id: string, data: Record<string, unknown>) => api.patch(`/coupons/${id}`, data),
  deleteCoupon: (id: string) => api.delete(`/coupons/${id}`),
};
