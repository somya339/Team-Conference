import axios from 'axios';
import { config } from '../config';
import { authService } from '../auth/AuthService';

const api = axios.create({
  baseURL: config.serverUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from AuthService (synchronous access to current token)
    const token = authService.currentToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log outgoing requests
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
      data: config.data,
      headers: config.headers,
      timestamp: new Date().toISOString(),
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString(),
    });
    return response;
  },
  (error) => {
    // Log error responses
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      timestamp: new Date().toISOString(),
    });

    if (error.response?.status === 401) {
      // Token expired or invalid
      console.warn('🔐 Unauthorized - Clearing auth data and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/signin';
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('🌐 Network error:', error.message);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    // Handle specific error codes
    switch (error.response.status) {
      case 400:
        console.error('📝 Bad request:', error.response.data);
        break;
      case 403:
        console.error('🚫 Forbidden:', error.response.data);
        break;
      case 404:
        console.error('🔍 Not found:', error.response.data);
        break;
      case 500:
        console.error('💥 Server error:', error.response.data);
        break;
      default:
        console.error('⚠️ API error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export { api as apiClient };
export default api;
