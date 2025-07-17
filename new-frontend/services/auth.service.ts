import api, { ApiResponse } from '@/lib/api';
import config from '@/config';

/**
 * User interface
 */
export interface User {
  id: string;
  email: string;
  role: string;
  full_name?: string; // Theo API documentation
  phone?: string;
  profile_picture_url?: string;
  email_verified?: boolean; // Theo API documentation
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Login request interface
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login response interface
 */
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

/**
 * Register request interface
 */
export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string; // Theo API documentation
}

/**
 * Register response interface
 */
export interface RegisterResponse {
  email: string;
  user: User;
}

/**
 * Change password request interface
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Email verification request interface
 */
export interface VerifyEmailRequest {
  token: string;
}

/**
 * Email verification response interface
 */
export interface VerifyEmailResponse {
  verified: boolean;
  alreadyVerified: boolean;
}

/**
 * Forgot password request interface
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Reset password request interface
 */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

/**
 * Auth service class
 */
class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return api.post<LoginResponse>(config.endpoints.auth.login, credentials, {
      skipAuth: true,
    });
  }

  /**
   * Register user
   */
  async register(userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    return api.post<RegisterResponse>(config.endpoints.auth.register, userData, {
      skipAuth: true,
    });
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<void>> {
    return api.post<void>(config.endpoints.auth.logout);
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<ApiResponse<User>> {
    return api.get<User>(config.endpoints.auth.profile);
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    return api.put<User>(config.endpoints.auth.profile, profileData);
  }

  /**
   * Update user profile picture
   */
  async updateProfilePicture(data: { profile_picture_url: string }): Promise<ApiResponse<any>> {
    return api.put('/api/auth/profile/picture', data);
  }

  /**
   * Change password
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<ApiResponse<void>> {
    return api.post<void>(config.endpoints.auth.changePassword, passwordData);
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
    return api.post<{ accessToken: string }>(config.endpoints.auth.refreshToken, {
      skipAuth: true,
    });
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<ApiResponse<VerifyEmailResponse>> {
    return api.post<VerifyEmailResponse>(config.endpoints.auth.verifyEmail, { token }, {
      skipAuth: true,
    });
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return api.post<void>(config.endpoints.auth.forgotPassword, { email }, {
      skipAuth: true,
    });
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return api.post<void>(config.endpoints.auth.resetPassword, { token, newPassword }, {
      skipAuth: true,
    });
  }

  /**
   * Resend email verification
   */
  async resendVerification(email: string): Promise<ApiResponse<void>> {
    return api.post<void>(config.endpoints.auth.resendVerification, { email }, {
      skipAuth: true,
    });
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem(config.jwt.storageKey);
    return !!token;
  }

  /**
   * Get current user from token (client-side only)
   */
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem(config.jwt.storageKey);
    if (!token) return null;

    try {
      // Decode JWT payload (basic implementation)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonPayload);
      
      // Check if token is expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return null;
      }

      return {
        id: payload.id || payload.sub,
        email: payload.email,
        role: payload.role,
        full_name: payload.full_name || payload.name, // Support both field names
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
