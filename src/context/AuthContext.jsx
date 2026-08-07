import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const getStoredAccessToken = () => {
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
};

const getStoredRefreshToken = () => {
  return localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
};

const storeTokens = ({ access, refresh }, rememberMe = false) => {
  if (rememberMe) {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  } else {
    sessionStorage.setItem('access_token', access);
    sessionStorage.setItem('refresh_token', refresh);
  }
};

const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('refresh_token');
};

const formatApiError = (error) => {
  if (!error) return 'Something went wrong.';

  if (error.isNetworkError) {
    return error.message || 'Network error. Please check your connection.';
  }

  const responseData = error.response?.data;
  if (!responseData) {
    return error.message || 'Request failed. Please try again.';
  }

  if (typeof responseData === 'string') {
    return responseData;
  }

  if (responseData.message) {
    return responseData.message;
  }

  if (responseData.detail) {
    return responseData.detail;
  }

  if (Array.isArray(responseData.errors)) {
    return responseData.errors.join(' ');
  }

  if (responseData.non_field_errors) {
    return Array.isArray(responseData.non_field_errors)
      ? responseData.non_field_errors.join(' ')
      : responseData.non_field_errors;
  }

  return JSON.stringify(responseData);
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(getStoredAccessToken());

  // Load user on mount or token changes
  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await api.get('/accounts/me/');  // REMOVED /api/v1/
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      clearTokens();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ===== AUTHENTICATION =====

  // Login
  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await api.post('/accounts/login/', {  // REMOVED /api/v1/
        email,
        password
      });

      const { access, refresh, user } = response.data;
      storeTokens({ access, refresh }, rememberMe);
      setToken(access);
      setUser(user);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: formatApiError(error) || 'Login failed. Please try again.'
      };
    }
  };

  // Register
  const register = async (userData) => {
    try {
      const response = await api.post('/accounts/register/', userData);  // REMOVED /api/v1/
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: formatApiError(error) || 'Registration failed. Please try again.'
      };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await api.post('/accounts/logout/');  // REMOVED /api/v1/
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
      setToken(null);
      setUser(null);
    }
  };

  // ===== PROFILE MANAGEMENT =====

  // Update Profile
  const updateProfile = async (data) => {
    try {
      const response = await api.put('/accounts/update-profile/', data);  // REMOVED /api/v1/
      setUser(response.data);
      return { success: true, user: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.response?.data?.detail || 'Update failed' 
      };
    }
  };

  // Change Password
  const changePassword = async (data) => {
    try {
      await api.post('/accounts/change-password/', data);  // REMOVED /api/v1/
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.response?.data?.detail || 'Password change failed' 
      };
    }
  };

  // ===== PASSWORD RESET =====

  // Forgot Password
  const forgotPassword = async (email) => {
    try {
      await api.post('/accounts/forgot-password/', { email });  // REMOVED /api/v1/
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.response?.data?.detail || 'Failed to send reset email' 
      };
    }
  };

  // Reset Password
  const resetPassword = async (token, newPassword) => {
    try {
      await api.post('/accounts/reset-password/', {  // REMOVED /api/v1/
        token,
        new_password: newPassword
      });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.response?.data?.detail || 'Failed to reset password' 
      };
    }
  };

  // ===== EMAIL VERIFICATION =====

  // Verify Email
  const verifyEmail = async (token) => {
    try {
      await api.get(`/accounts/verify-email/?token=${token}`);  // REMOVED /api/v1/
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.response?.data?.detail || 'Email verification failed' 
      };
    }
  };

  // Resend Verification Email
  const resendVerificationEmail = async (email) => {
    try {
      await api.post('/accounts/resend-verification-email/', { email });  // REMOVED /api/v1/
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.response?.data?.detail || 'Failed to resend verification email' 
      };
    }
  };

  // ===== TOKEN MANAGEMENT =====

  // Refresh Token
  const refreshToken = async () => {
    try {
      const refresh = getStoredRefreshToken();
      if (!refresh) {
        throw new Error('No refresh token available');
      }
      
      const response = await api.post('/accounts/refresh-token/', {  // REMOVED /api/v1/
        refresh
      });
      
      const { access } = response.data;
      if (localStorage.getItem('refresh_token')) {
        localStorage.setItem('access_token', access);
      } else if (sessionStorage.getItem('refresh_token')) {
        sessionStorage.setItem('access_token', access);
      } else {
        localStorage.setItem('access_token', access);
      }
      setToken(access);
      return { success: true };
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return { 
        success: false, 
        error: 'Session expired. Please login again.' 
      };
    }
  };

  // ===== VALUE OBJECT =====
  const value = {
    // State
    user,
    loading,
    token,
    
    // Authentication
    login,
    register,
    logout,
    
    // Profile
    updateProfile,
    changePassword,
    fetchUser,
    
    // Password Reset
    forgotPassword,
    resetPassword,
    
    // Email Verification
    verifyEmail,
    resendVerificationEmail,
    
    // Token
    refreshToken,
    
    // Helpers
    isAuthenticated: !!token,
    isSupplier: user?.accountType === 'supplier' || user?.account_type === 'supplier',
    isBuyer: user?.accountType === 'buyer' || user?.account_type === 'buyer',
    isEmailVerified: user?.isEmailVerified || user?.is_email_verified || false,
    isBusinessVerified: user?.isBusinessVerified || user?.is_business_verified || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ===== CUSTOM HOOK - MUST BE EXPORTED =====
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ===== DEFAULT EXPORT =====
export default AuthContext;
