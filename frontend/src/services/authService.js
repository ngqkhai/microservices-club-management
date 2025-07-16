import apiClient from './api';
import { removeAuthToken, setCurrentUser, removeCurrentUser } from '../utils/auth';

export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/api/auth/register', {
      email: userData.email,
      password: userData.password,
      full_name: userData.fullName
    });
    
    return {
      success: true,
      data: response.data,
      message: 'Registration successful. Please check your email for verification.'
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Registration failed',
      errors: error.response?.data?.errors || []
    };
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/api/auth/login', credentials);
    
    if (response.data.success) {
      // Lưu tokens - API trả về "accessToken" không phải "access_token"
      localStorage.setItem('access_token', response.data.data.accessToken);
      
      // Lưu user info
      setCurrentUser(response.data.data.user);
    }
    
    return {
      success: true,
      data: response.data.data,
      message: 'Login successful'
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Login failed',
      errors: error.response?.data?.errors || []
    };
  }
};

export const logoutUser = async () => {
  try {
    await apiClient.post('/api/auth/logout');
    
    // Clear local storage
    removeAuthToken();
    removeCurrentUser();
    
    return {
      success: true,
      message: 'Logout successful'
    };
  } catch (error) {
    // Clear local storage even if API call fails
    removeAuthToken();
    removeCurrentUser();
    
    return {
      success: true,
      message: 'Logout completed'
    };
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await apiClient.post('/api/auth/forgot-password', { email });
    
    return {
      success: true,
      message: 'Password reset link sent to your email'
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to send reset email'
    };
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await apiClient.post('/api/auth/reset-password', {
      token,
      password: newPassword
    });
    
    return {
      success: true,
      message: 'Password reset successful'
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Password reset failed'
    };
  }
};

export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/api/auth/profile');
    
    console.log('getUserProfile API response:', response);
    console.log('Response data:', response.data);
    
    // API trả về { success: true, data: {...} }
    // Nên chúng ta cần trả về response.data.data
    return {
      success: response.data.success,
      data: response.data.data
    };
  } catch (error) {
    console.error('getUserProfile API error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get profile'
    };
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/api/auth/profile', profileData);
    
    // Update local storage
    setCurrentUser(response.data);
    
    return {
      success: true,
      data: response.data,
      message: 'Profile updated successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update profile'
    };
  }
};

export const deleteAccount = async () => {
  try {
    await apiClient.delete('/api/auth/me');
    
    // Clear local storage
    removeAuthToken();
    removeCurrentUser();
    
    return {
      success: true,
      message: 'Account deleted successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete account'
    };
  }
};
