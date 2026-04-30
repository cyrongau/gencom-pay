import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.generexcom.com',
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const merchantId = typeof window !== 'undefined' ? localStorage.getItem('activeMerchantId') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (merchantId) {
      config.headers['x-merchant-id'] = merchantId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
