import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import GuestLayout from './GuestLayout';
import UserLayout from './UserLayout';

const LayoutWrapper = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();

  if (isAuthenticated) {
    return (
      <UserLayout user={user} onLogout={logout}>
        {children}
      </UserLayout>
    );
  }

  return (
    <GuestLayout>
      {children}
    </GuestLayout>
  );
};

export default LayoutWrapper;
