import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject JWT Bearer token into outgoing requests and normalize URLs
api.interceptors.request.use(
  (config) => {
    // If URL begins with /api/, strip it since baseURL already includes /api
    if (typeof config.url === 'string' && config.url.startsWith('/api/')) {
      config.url = config.url.substring(4);
    }
    const token = localStorage.getItem('careerforge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global 401 unauthenticated redirects
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, clear local storage
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        localStorage.removeItem('careerforge_token');
        localStorage.removeItem('careerforge_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
