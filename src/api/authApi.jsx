// src/api/authApi.js
import api from '../services/api';

// Get current user
export const getMe = async () => {
  try {
    const response = await api.get('/api/v1/accounts/me/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update profile
export const updateProfile = async (data) => {
  try {
    const response = await api.put('/api/v1/accounts/update-profile/', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Change password
export const changePassword = async (data) => {
  try {
    const response = await api.post('/api/v1/accounts/change-password/', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Forgot password
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/api/v1/accounts/forgot-password/', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Reset password
export const resetPassword = async (data) => {
  try {
    const response = await api.post('/api/v1/accounts/reset-password/', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Verify email
export const verifyEmail = async (token) => {
  try {
    const response = await api.get(`/api/v1/accounts/verify-email/?token=${token}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Resend verification email
export const resendVerification = async (email) => {
  try {
    const response = await api.post('/api/v1/accounts/resend-verification-email/', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification
};