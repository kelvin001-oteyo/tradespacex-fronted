// src/api/authApi.js
import api from '../services/api';

// Get current user
export const getMe = async () => {
  try {
    const response = await api.get('/accounts/me/');  // Removed /api/v1/
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update profile
export const updateProfile = async (data) => {
  try {
    const response = await api.put('/accounts/update-profile/', data);  // Removed /api/v1/
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Change password
export const changePassword = async (data) => {
  try {
    const response = await api.post('/accounts/change-password/', data);  // Removed /api/v1/
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Forgot password
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/accounts/forgot-password/', { email });  // Removed /api/v1/
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Reset password
export const resetPassword = async (data) => {
  try {
    const response = await api.post('/accounts/reset-password/', data);  // Removed /api/v1/
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Verify email
export const verifyEmail = async (token) => {
  try {
    const response = await api.get(`/accounts/verify-email/?token=${token}`);  // Removed /api/v1/
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Resend verification email
export const resendVerification = async (email) => {
  try {
    const response = await api.post('/accounts/resend-verification-email/', { email });  // Removed /api/v1/
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
