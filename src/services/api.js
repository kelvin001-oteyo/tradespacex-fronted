// src/services/api.js
import axios from 'axios';

// --------------------------------------------------
// API BASE URL
// Development: use Vite proxy
// Production: use Render backend
// --------------------------------------------------

const API_BASE_URL =
  import.meta.env.MODE === 'development'
    ? ''
    : (import.meta.env.VITE_API_URL ||
      'https://tradespacex-backend.onrender.com/api/v1');  // ✅ Include /api/v1 here

// No need to add /api/v1 again
const API_URL = API_BASE_URL || '/api/v1';

console.log('🔵 API Base URL:', API_URL);

// --------------------------------------------------
// TOKEN HELPERS
// --------------------------------------------------

const getStoredToken = () => {
  return (
    localStorage.getItem('access_token') ||
    sessionStorage.getItem('access_token')
  );
};

const getStoredRefreshToken = () => {
  return (
    localStorage.getItem('refresh_token') ||
    sessionStorage.getItem('refresh_token')
  );
};

const saveAccessToken = (access) => {
  if (localStorage.getItem('refresh_token')) {
    localStorage.setItem('access_token', access);
  } else if (sessionStorage.getItem('refresh_token')) {
    sessionStorage.setItem('access_token', access);
  } else {
    localStorage.setItem('access_token', access);
  }
};

const clearStoredTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');

  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('refresh_token');
};

// --------------------------------------------------
// AXIOS INSTANCE
// --------------------------------------------------

const api = axios.create({
  baseURL: API_URL,

  headers: {
    'Content-Type': 'application/json',
  },

  timeout: 30000,
});

// --------------------------------------------------
// REQUEST INTERCEPTOR
// --------------------------------------------------

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      `📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
    );

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// --------------------------------------------------
// RESPONSE INTERCEPTOR
// --------------------------------------------------

api.interceptors.response.use(
  (response) => {
    console.log(
      `📥 ${response.status} ${response.config.url}`
    );

    return response;
  },

  async (error) => {
    // Network / CORS error
    if (
      error.code === 'ERR_NETWORK' ||
      error.message?.toLowerCase().includes('network')
    ) {
      console.warn('⚠️ Network error - CORS or connection issue');

      return Promise.reject({
        ...error,
        isNetworkError: true,
        message: 'Network error. Please check your connection.',
      });
    }

    const originalRequest = error.config;

    // --------------------------------------------------
    // TOKEN REFRESH
    // --------------------------------------------------

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = getStoredRefreshToken();

        if (refreshToken) {
          const response = await axios.post(
            `${API_URL}/accounts/refresh/`,  // ✅ Fixed endpoint
            {
              refresh: refreshToken,
            }
          );

          const { access } = response.data;

          if (access) {
            saveAccessToken(access);

            originalRequest.headers.Authorization =
              `Bearer ${access}`;

            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error(
          '❌ Token refresh failed:',
          refreshError
        );

        clearStoredTokens();

        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
