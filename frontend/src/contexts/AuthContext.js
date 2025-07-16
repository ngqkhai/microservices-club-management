import React, { createContext, useContext, useState, useEffect } from 'react';
import { isAuthenticated, getCurrentUser } from '../utils/auth';
import { logoutUser } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = () => {
    try {
      console.log('Checking auth state...');
      const token = localStorage.getItem('access_token');
      const userJson = localStorage.getItem('user');
      
      console.log('Token:', token ? 'exists' : 'missing');
      console.log('User data:', userJson ? 'exists' : 'missing');
      
      if (isAuthenticated()) {
        const currentUser = getCurrentUser();
        console.log('User authenticated:', currentUser);
        setUser(currentUser);
      } else {
        console.log('User not authenticated');
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData.user);
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear user state even if API call fails
      setUser(null);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    checkAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
