import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useAuthRedirect = () => {
  const { isAuthenticated } = useAuth();

  // Có thể thêm logic để redirect hoặc xử lý khác khi auth state thay đổi
  useEffect(() => {
    // Logic có thể được thêm vào đây nếu cần
  }, [isAuthenticated]);

  return { isAuthenticated };
};
