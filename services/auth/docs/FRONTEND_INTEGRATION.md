# Auth Service - Frontend Integration Guide

A comprehensive guide for frontend engineers to integrate with the auth microservice in the club management system.

## 🚀 Quick Start

### Base URL
```
http://localhost:3001/api/auth
```

### Content Type
All requests should include:
```json
{
  "Content-Type": "application/json"
}
```

### Response Format
All responses follow this structure:
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}
```

## 🔐 Authentication Flow

### 1. User Registration

**Endpoint:** `POST /api/auth/register`

**Request:**
```typescript
interface RegisterRequest {
  email: string;           // Valid email format
  password: string;        // Min 8 chars, must contain: uppercase, lowercase, number, special char
  full_name: string;       // 2-100 chars, letters and spaces only
  confirmPassword?: string; // Optional, must match password
}
```

**Example:**
```javascript
const registerUser = async (userData) => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'SecurePass123!',
        full_name: 'John Doe'
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Registration successful
      console.log('User registered:', result.message);
      // Redirect to login or verification page
    } else {
      // Handle validation errors
      console.error('Registration failed:', result.errors);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};
```

**Response:**
```typescript
interface RegisterResponse {
  success: true;
  message: string; // "Registration successful. Please login to access your account."
  data: {
    user: {
      id: string;
      email: string;
      full_name: string;
      role: 'USER' | 'ADMIN';
      email_verified: boolean;
      created_at: string;
    }
  }
}
```

### 2. Email Verification

**Endpoint:** `POST /api/auth/verify-email`

**Request:**
```typescript
interface VerifyEmailRequest {
  token: string; // JWT token from verification email
}
```

**Example:**
```javascript
const verifyEmail = async (token) => {
  try {
    const response = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Email verified:', result.message);
      // Redirect to login page
    }
  } catch (error) {
    console.error('Verification failed:', error);
  }
};
```

### 3. User Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```typescript
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean; // Default: false
}
```

**Example:**
```javascript
const loginUser = async (credentials) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: Include cookies
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'SecurePass123!',
        rememberMe: true
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Store access token (localStorage or secure storage)
      localStorage.setItem('accessToken', result.data.accessToken);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      
      // Refresh token is automatically set as HTTP-only cookie
      console.log('Login successful');
      
      // Redirect to dashboard
    } else {
      console.error('Login failed:', result.message);
    }
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

**Response:**
```typescript
interface LoginResponse {
  success: true;
  message: string;
  data: {
    user: User;
    accessToken: string;
    // Note: refreshToken is set as HTTP-only cookie
  }
}
```

### 4. Token Refresh

**Endpoint:** `POST /api/auth/refresh`

**Important:** This endpoint uses the HTTP-only cookie automatically.

**Example:**
```javascript
const refreshToken = async () => {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Essential for including cookies
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Update stored access token
      localStorage.setItem('accessToken', result.data.accessToken);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      return result.data.accessToken;
    } else {
      // Refresh failed, redirect to login
      handleLogout();
      return null;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    handleLogout();
    return null;
  }
};
```

### 5. Get Current User

**Endpoint:** `GET /api/auth/me`

**Headers Required:** User must be authenticated via API Gateway

**Example:**
```javascript
const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.data.user;
    } else {
      // Token might be expired, try refresh
      const newToken = await refreshToken();
      if (newToken) {
        // Retry with new token
        return getCurrentUser();
      }
    }
  } catch (error) {
    console.error('Get user failed:', error);
    return null;
  }
};
```

### 6. User Logout

**Endpoint:** `POST /api/auth/logout`

**Example:**
```javascript
const logoutUser = async () => {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    const result = await response.json();
    
    // Clear local storage regardless of response
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    
    // Redirect to login page
    window.location.href = '/login';
    
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }
};
```

## 🔑 Password Management

### Forgot Password

**Endpoint:** `POST /api/auth/forgot-password`

**Request:**
```typescript
interface ForgotPasswordRequest {
  email: string;
}
```

**Example:**
```javascript
const forgotPassword = async (email) => {
  try {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Show success message
      alert('Password reset email sent. Please check your inbox.');
    }
  } catch (error) {
    console.error('Forgot password error:', error);
  }
};
```

### Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Request:**
```typescript
interface ResetPasswordRequest {
  token: string;      // From email link
  newPassword: string; // Same validation as registration
}
```

**Example:**
```javascript
const resetPassword = async (token, newPassword) => {
  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Redirect to login with success message
      window.location.href = '/login?message=password-reset-success';
    }
  } catch (error) {
    console.error('Reset password error:', error);
  }
};
```

### Change Password

**Endpoint:** `POST /api/auth/change-password`

**Headers Required:** User must be authenticated

**Request:**
```typescript
interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
```

**Example:**
```javascript
const changePassword = async (currentPassword, newPassword) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Password changed successfully, user needs to login again
      alert('Password changed successfully. Please login again.');
      handleLogout();
    }
  } catch (error) {
    console.error('Change password error:', error);
  }
};
```

## 🛡️ Authentication Helper Functions

### Auth Context (React Example)

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));

  // Auto-refresh token before expiration
  useEffect(() => {
    if (accessToken) {
      // JWT tokens expire in 15 minutes, refresh every 10 minutes
      const refreshInterval = setInterval(async () => {
        const newToken = await refreshToken();
        if (newToken) {
          setAccessToken(newToken);
        }
      }, 10 * 60 * 1000); // 10 minutes

      return () => clearInterval(refreshInterval);
    }
  }, [accessToken]);

  // Initialize user on app start
  useEffect(() => {
    const initializeAuth = async () => {
      if (accessToken) {
        try {
          const userData = await getCurrentUser();
          if (userData) {
            setUser(userData);
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            setAccessToken(null);
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setAccessToken(result.data.accessToken);
        setUser(result.data.user);
        localStorage.setItem('accessToken', result.data.accessToken);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        return { success: true };
      } else {
        return { success: false, message: result.message, errors: result.errors };
      }
    } catch (error) {
      return { success: false, message: 'Network error occurred' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    accessToken,
    login,
    logout,
    refreshToken: () => refreshToken().then(token => {
      if (token) setAccessToken(token);
      return token;
    })
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Axios Interceptor Example

```javascript
import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true, // Important for cookies
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post('/api/auth/refresh', {}, {
          withCredentials: true
        });

        if (refreshResponse.data.success) {
          const newToken = refreshResponse.data.data.accessToken;
          localStorage.setItem('accessToken', newToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

## ⚠️ Error Handling

### Common Error Responses

```typescript
// Validation Error (400)
{
  success: false,
  message: "Validation error",
  errors: [
    {
      field: "email",
      message: "Please provide a valid email address",
      value: "invalid-email"
    }
  ]
}

// Unauthorized (401)
{
  success: false,
  message: "Invalid credentials",
  code: "INVALID_CREDENTIALS"
}

// Account Locked (423)
{
  success: false,
  message: "Account temporarily locked due to too many failed login attempts",
  code: "ACCOUNT_LOCKED",
  details: {
    lockTime: "30 minutes",
    unlockAt: "2024-01-01T12:30:00Z"
  }
}

// Rate Limited (429)
{
  success: false,
  message: "Too many requests. Please try again later.",
  code: "RATE_LIMIT_EXCEEDED",
  details: {
    retryAfter: 300 // seconds
  }
}
```

### Error Handler Function

```javascript
const handleApiError = (error, response) => {
  if (response?.data?.success === false) {
    const { message, code, errors, details } = response.data;
    
    switch (code) {
      case 'INVALID_CREDENTIALS':
        return 'Invalid email or password';
      
      case 'ACCOUNT_LOCKED':
        return `Account locked. Try again in ${details?.lockTime || '30 minutes'}`;
      
      case 'RATE_LIMIT_EXCEEDED':
        return `Too many requests. Try again in ${details?.retryAfter || 300} seconds`;
      
      case 'EMAIL_NOT_VERIFIED':
        return 'Please verify your email address before logging in';
      
      default:
        if (errors && errors.length > 0) {
          return errors.map(err => err.message).join(', ');
        }
        return message || 'An unexpected error occurred';
    }
  }
  
  return 'Network error. Please check your connection.';
};
```

## 🔍 Health Checks

### Health Check Endpoint

**Endpoint:** `GET /api/auth/health`

**Example:**
```javascript
const checkServiceHealth = async () => {
  try {
    const response = await fetch('/api/auth/health');
    const health = await response.json();
    
    console.log('Service Status:', health.status);
    console.log('Database:', health.database.status);
    console.log('RabbitMQ:', health.rabbitmq?.status);
    
    return health.status === 'healthy';
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};
```

## 📝 Validation Rules

### Password Requirements
- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter  
- At least one number
- At least one special character (@$!%*?&)

### Email Requirements
- Valid email format
- Automatically converted to lowercase

### Name Requirements
- 2-100 characters
- Letters and spaces only
- Leading/trailing spaces trimmed

## 🔒 Security Best Practices

### 1. Token Storage
```javascript
// ✅ Good: Store access token in memory or localStorage
localStorage.setItem('accessToken', token);

// ❌ Bad: Don't try to access refresh token (it's HTTP-only)
// The refresh token is automatically handled by the browser
```

### 2. Request Configuration
```javascript
// ✅ Always include credentials for cookie support
fetch('/api/auth/login', {
  credentials: 'include',
  // ... other options
});

// ✅ Always set proper headers
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
}
```

### 3. Logout Handling
```javascript
// ✅ Complete logout process
const handleLogout = async () => {
  try {
    // Call logout endpoint
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } finally {
    // Always clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    
    // Redirect to login
    window.location.href = '/login';
  }
};
```

### 4. Auto Token Refresh
```javascript
// ✅ Implement automatic token refresh
const setupTokenRefresh = () => {
  // Refresh every 10 minutes (tokens expire in 15)
  setInterval(async () => {
    const newToken = await refreshToken();
    if (!newToken) {
      // Refresh failed, logout user
      handleLogout();
    }
  }, 10 * 60 * 1000);
};
```

## 🚨 Rate Limiting

The auth service implements different rate limits:

- **Registration:** 5 attempts per 15 minutes per IP
- **Login:** 10 attempts per 15 minutes per IP
- **Password Reset:** 3 attempts per 15 minutes per IP  
- **Token Refresh:** 20 attempts per 15 minutes per IP

Handle rate limiting gracefully:

```javascript
const handleRateLimit = (response) => {
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After') || 300;
    const minutes = Math.ceil(retryAfter / 60);
    
    alert(`Too many attempts. Please try again in ${minutes} minutes.`);
    
    // Optionally implement a countdown timer
    startCountdownTimer(retryAfter);
  }
};
```

## 📱 Frontend Framework Examples

### React Hook

```javascript
import { useState, useEffect } from 'react';

export const useAuthStatus = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const userData = await getCurrentUser();
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  return { isAuthenticated, user, loading };
};
```

### Vue.js Composable

```javascript
import { ref, onMounted } from 'vue';

export function useAuth() {
  const user = ref(null);
  const isAuthenticated = ref(false);
  const loading = ref(true);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const userData = await getCurrentUser();
        if (userData) {
          user.value = userData;
          isAuthenticated.value = true;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    }
    loading.value = false;
  };

  onMounted(checkAuthStatus);

  return {
    user,
    isAuthenticated,
    loading,
    checkAuthStatus
  };
}
```

## 🎯 Complete Integration Checklist

- [ ] Configure base URL and headers
- [ ] Implement user registration flow
- [ ] Implement login with token storage
- [ ] Set up automatic token refresh
- [ ] Handle logout properly
- [ ] Implement password reset flow
- [ ] Add error handling for all scenarios
- [ ] Configure request interceptors
- [ ] Handle rate limiting
- [ ] Test authentication state persistence
- [ ] Implement auth guards/route protection
- [ ] Add loading states for auth operations
- [ ] Test cross-tab synchronization
- [ ] Verify cookie handling works correctly

## 🆘 Troubleshooting

### Common Issues

1. **Cookies not being sent**
   - Ensure `credentials: 'include'` in all requests
   - Check CORS configuration allows credentials

2. **Token refresh failing**
   - Verify refresh token cookie exists
   - Check cookie domain and path settings

3. **CORS errors**
   - Ensure API Gateway is properly configured
   - Check frontend URL is in CORS allowlist

4. **Rate limiting issues**
   - Implement exponential backoff
   - Show user-friendly error messages

## 📞 Support

For issues or questions:
- Check service health: `GET /api/auth/health`
- Review API documentation: `http://localhost:3001/api/auth/docs`
- Check service logs for detailed error information