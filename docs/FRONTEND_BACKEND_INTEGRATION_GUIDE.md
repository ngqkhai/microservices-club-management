# Frontend - Backend Integration Guide
## User Stories US001 - US008

### Tổng quan kiến trúc

Hệ thống Club Management sử dụng kiến trúc microservices với:
- **API Gateway (Kong)**: `http://localhost:8000` - điểm truy cập duy nhất cho Frontend
- **Auth Service**: `http://localhost:3001` - quản lý xác thực và phân quyền
- **Club Service**: `http://localhost:3002` - quản lý thông tin câu lạc bộ
- **Event Service**: `http://localhost:3003` - quản lý sự kiện
- **Frontend**: `http://localhost:3000` - React application

### Cấu hình Base URL

```javascript
// src/config/api.js
const API_CONFIG = {
  BASE_URL: 'http://localhost:8000', // Kong API Gateway
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

export default API_CONFIG;
```

### Authentication Flow

#### JWT Token Management
```javascript
// src/utils/auth.js
export const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

export const setAuthToken = (token) => {
  localStorage.setItem('access_token', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
```

#### Axios Interceptor Setup
```javascript
// src/services/api.js
import axios from 'axios';
import API_CONFIG from '../config/api';
import { getAuthToken, removeAuthToken } from '../utils/auth';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS
});

// Request interceptor - thêm JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - xử lý token expired
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      removeAuthToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## US001: Register Account

### API Endpoint
```
POST /api/auth/register
```

### Request Body
```javascript
{
  "email": "user@example.com",
  "password": "password123",  // Min 8 characters
  "full_name": "John Doe"
}
```

### Frontend Implementation

```javascript
// src/services/authService.js
import apiClient from './api';

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
```

### React Component
```jsx
// src/components/auth/RegisterForm.jsx
import React, { useState } from 'react';
import { registerUser } from '../../services/authService';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await registerUser(formData);
    
    if (result.success) {
      setMessage('Registration successful! Please check your email for verification.');
      setFormData({ fullName: '', email: '', password: '' });
    } else {
      setMessage(result.message);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Full Name:</label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
          required
          minLength={2}
        />
      </div>
      
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
      </div>
      
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
          minLength={8}
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
      
      {message && <div className="message">{message}</div>}
    </form>
  );
};

export default RegisterForm;
```

### Response Format
```javascript
// Success Response
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "email_verified": false,
      "created_at": "2025-01-16T10:00:00Z"
    }
  }
}

// Error Response
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email already exists"
    }
  ]
}
```

---

## US002: Log In to Account

### API Endpoint
```
POST /api/auth/login
```

### Request Body
```javascript
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Frontend Implementation

```javascript
// src/services/authService.js
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/api/auth/login', credentials);
    
    if (response.data.success) {
      // Lưu tokens
      localStorage.setItem('access_token', response.data.data.access_token);
      localStorage.setItem('refresh_token', response.data.data.refresh_token);
      
      // Lưu user info
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
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
```

### React Component
```jsx
// src/components/auth/LoginForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/authService';

const LoginForm = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await loginUser(credentials);
    
    if (result.success) {
      // Redirect to dashboard
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={credentials.email}
          onChange={(e) => setCredentials({...credentials, email: e.target.value})}
          required
        />
      </div>
      
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={credentials.password}
          onChange={(e) => setCredentials({...credentials, password: e.target.value})}
          required
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default LoginForm;
```

### Response Format
```javascript
// Success Response
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "USER",
      "email_verified": true,
      "last_login": "2025-01-16T10:00:00Z"
    },
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "uuid-refresh-token",
    "expires_in": 900
  }
}
```

---

## US003: Log Out of Account

### API Endpoint
```
POST /api/auth/logout
```

### Frontend Implementation

```javascript
// src/services/authService.js
export const logoutUser = async () => {
  try {
    await apiClient.post('/api/auth/logout');
    
    // Clear local storage
    removeAuthToken();
    localStorage.removeItem('user');
    
    return {
      success: true,
      message: 'Logout successful'
    };
  } catch (error) {
    // Clear local storage even if API call fails
    removeAuthToken();
    localStorage.removeItem('user');
    
    return {
      success: true,
      message: 'Logout completed'
    };
  }
};
```

### React Component
```jsx
// src/components/auth/LogoutButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../services/authService';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await logoutUser();
    navigate('/login');
  };

  return (
    <button onClick={handleLogout} className="logout-btn">
      Logout
    </button>
  );
};

export default LogoutButton;
```

---

## US004: Reset Password

### API Endpoints

#### 1. Request Password Reset
```
POST /api/auth/forgot-password
```

#### 2. Reset Password
```
POST /api/auth/reset-password
```

### Frontend Implementation

```javascript
// src/services/authService.js
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
```

### React Components

```jsx
// src/components/auth/ForgotPasswordForm.jsx
import React, { useState } from 'react';
import { requestPasswordReset } from '../../services/authService';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await requestPasswordReset(email);
    setMessage(result.message);
    
    if (result.success) {
      setEmail('');
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>
      
      {message && <div className="message">{message}</div>}
    </form>
  );
};

export default ForgotPasswordForm;
```

```jsx
// src/components/auth/ResetPasswordForm.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/authService';

const ResetPasswordForm = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    const result = await resetPassword(token, password);
    setMessage(result.message);
    
    if (result.success) {
      setTimeout(() => navigate('/login'), 2000);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>New Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>
      
      <div>
        <label>Confirm Password:</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
      
      {message && <div className="message">{message}</div>}
    </form>
  );
};

export default ResetPasswordForm;
```

---

## US005: Update Account Information

### API Endpoints

#### 1. Get Profile
```
GET /api/auth/profile
```

#### 2. Update Profile
```
PUT /api/auth/profile
```

### Frontend Implementation

```javascript
// src/services/authService.js
export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/api/auth/profile');
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
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
    localStorage.setItem('user', JSON.stringify(response.data));
    
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
```

### React Component

```jsx
// src/components/profile/ProfileForm.jsx
import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../../services/authService';

const ProfileForm = () => {
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const result = await getUserProfile();
    if (result.success) {
      setProfile(result.data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await updateUserProfile(profile);
    setMessage(result.message);
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Full Name:</label>
        <input
          type="text"
          value={profile.full_name}
          onChange={(e) => setProfile({...profile, full_name: e.target.value})}
          required
        />
      </div>
      
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={profile.email}
          onChange={(e) => setProfile({...profile, email: e.target.value})}
          required
        />
      </div>
      
      <div>
        <label>Phone:</label>
        <input
          type="tel"
          value={profile.phone || ''}
          onChange={(e) => setProfile({...profile, phone: e.target.value})}
        />
      </div>
      
      <div>
        <label>Bio:</label>
        <textarea
          value={profile.bio || ''}
          onChange={(e) => setProfile({...profile, bio: e.target.value})}
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Profile'}
      </button>
      
      {message && <div className="message">{message}</div>}
    </form>
  );
};

export default ProfileForm;
```

---

## US006: Delete Account

### API Endpoint
```
DELETE /api/auth/me
```

### Frontend Implementation

```javascript
// src/services/authService.js
export const deleteAccount = async () => {
  try {
    await apiClient.delete('/api/auth/me');
    
    // Clear local storage
    removeAuthToken();
    localStorage.removeItem('user');
    
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
```

### React Component

```jsx
// src/components/profile/DeleteAccountButton.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteAccount } from '../../services/authService';

const DeleteAccountButton = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    setLoading(true);
    
    const result = await deleteAccount();
    
    if (result.success) {
      alert('Account deleted successfully');
      navigate('/');
    } else {
      alert(result.message);
    }
    
    setLoading(false);
    setShowConfirm(false);
  };

  return (
    <div>
      <button 
        onClick={() => setShowConfirm(true)}
        className="btn btn-danger"
      >
        Delete Account
      </button>
      
      {showConfirm && (
        <div className="confirmation-modal">
          <p>Are you sure you want to delete your account? This action cannot be undone.</p>
          <button onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Yes, Delete'}
          </button>
          <button onClick={() => setShowConfirm(false)}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default DeleteAccountButton;
```

---

## US007: Filter/Search Clubs

### API Endpoint
```
GET /api/clubs
```

### Query Parameters
```javascript
{
  search: string,      // Search across name, description, category, location
  name: string,        // Filter by club name (partial match)
  category: string,    // Filter by category (exact match)
  location: string,    // Filter by location (partial match)
  sort: string,        // Sort by: name, name_desc, category, location, newest, oldest, relevance
  page: number,        // Page number (default: 1)
  limit: number        // Items per page (default: 10, max: 100)
}
```

### Frontend Implementation

```javascript
// src/services/clubService.js
import apiClient from './api';

export const searchClubs = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add filters to params
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await apiClient.get(`/api/clubs?${params.toString()}`);
    
    return {
      success: true,
      data: response.data.data,
      meta: response.data.meta
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to search clubs',
      data: []
    };
  }
};

export const getClubCategories = async () => {
  try {
    const response = await apiClient.get('/api/clubs/categories');
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      data: []
    };
  }
};

export const getClubLocations = async () => {
  try {
    const response = await apiClient.get('/api/clubs/locations');
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      data: []
    };
  }
};
```

### React Component

```jsx
// src/components/clubs/ClubSearch.jsx
import React, { useState, useEffect } from 'react';
import { searchClubs, getClubCategories, getClubLocations } from '../../services/clubService';

const ClubSearch = () => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
    sort: 'relevance',
    page: 1,
    limit: 10
  });
  const [clubs, setClubs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    loadFilterOptions();
    handleSearch();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [filters]);

  const loadFilterOptions = async () => {
    const [categoriesResult, locationsResult] = await Promise.all([
      getClubCategories(),
      getClubLocations()
    ]);
    
    if (categoriesResult.success) {
      setCategories(categoriesResult.data);
    }
    
    if (locationsResult.success) {
      setLocations(locationsResult.data);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    
    const result = await searchClubs(filters);
    
    if (result.success) {
      setClubs(result.data.clubs || result.data);
      setTotalResults(result.data.total || result.data.length);
    }
    
    setLoading(false);
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset page when other filters change
    }));
  };

  return (
    <div className="club-search">
      {/* Search Form */}
      <div className="search-form">
        <div className="search-input">
          <input
            type="text"
            placeholder="Search clubs..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
        </div>
        
        <div className="filters">
          <select
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <select
            value={filters.location}
            onChange={(e) => updateFilter('location', e.target.value)}
          >
            <option value="">All Locations</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          
          <select
            value={filters.sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
          >
            <option value="relevance">Relevance</option>
            <option value="name">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="search-results">
        {loading ? (
          <div>Searching...</div>
        ) : (
          <>
            <div className="results-header">
              <span>{totalResults} clubs found</span>
            </div>
            
            <div className="clubs-grid">
              {clubs.map(club => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
            
            {/* Pagination */}
            <Pagination
              currentPage={filters.page}
              totalItems={totalResults}
              itemsPerPage={filters.limit}
              onPageChange={(page) => updateFilter('page', page)}
            />
          </>
        )}
      </div>
    </div>
  );
};

// Club Card Component
const ClubCard = ({ club }) => (
  <div className="club-card">
    <img src={club.logo_url || '/default-club-logo.png'} alt={club.name} />
    <div className="club-info">
      <h3>{club.name}</h3>
      <p className="category">{club.category}</p>
      <p className="location">{club.location}</p>
      <p className="description">{club.description}</p>
      <div className="club-stats">
        <span>Members: {club.member_count || 0}</span>
      </div>
    </div>
  </div>
);

// Pagination Component
const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  return (
    <div className="pagination">
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        Previous
      </button>
      
      <span>Page {currentPage} of {totalPages}</span>
      
      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default ClubSearch;
```

---

## US008: View Club Information

### API Endpoint
```
GET /api/clubs/:id
```

### Frontend Implementation

```javascript
// src/services/clubService.js
export const getClubById = async (clubId) => {
  try {
    const response = await apiClient.get(`/api/clubs/${clubId}`);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get club information'
    };
  }
};

export const getClubRecruitments = async (clubId) => {
  try {
    const response = await apiClient.get(`/api/clubs/${clubId}/recruitments`);
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get recruitment campaigns',
      data: []
    };
  }
};
```

### React Component

```jsx
// src/components/clubs/ClubDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getClubById, getClubRecruitments } from '../../services/clubService';

const ClubDetail = () => {
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [recruitments, setRecruitments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClubData();
  }, [id]);

  const loadClubData = async () => {
    setLoading(true);
    
    const [clubResult, recruitmentsResult] = await Promise.all([
      getClubById(id),
      getClubRecruitments(id)
    ]);
    
    if (clubResult.success) {
      setClub(clubResult.data);
    } else {
      setError(clubResult.message);
    }
    
    if (recruitmentsResult.success) {
      setRecruitments(recruitmentsResult.data);
    }
    
    setLoading(false);
  };

  if (loading) return <div>Loading club information...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!club) return <div>Club not found</div>;

  return (
    <div className="club-detail">
      {/* Club Header */}
      <div className="club-header">
        <img 
          src={club.logo_url || '/default-club-logo.png'} 
          alt={club.name}
          className="club-logo"
        />
        <div className="club-basic-info">
          <h1>{club.name}</h1>
          <p className="category">{club.category}</p>
          <p className="location">{club.location}</p>
          <div className="club-stats">
            <span>👥 {club.member_count || 0} members</span>
            <span>📅 Since {new Date(club.created_at).getFullYear()}</span>
          </div>
        </div>
      </div>

      {/* Club Description */}
      <div className="club-description">
        <h2>About This Club</h2>
        <p>{club.description}</p>
      </div>

      {/* Contact Information */}
      <div className="club-contact">
        <h2>Contact Information</h2>
        <div className="contact-details">
          {club.contact_email && (
            <div>
              <strong>Email:</strong> 
              <a href={`mailto:${club.contact_email}`}>{club.contact_email}</a>
            </div>
          )}
          {club.contact_phone && (
            <div>
              <strong>Phone:</strong> {club.contact_phone}
            </div>
          )}
          {club.website_url && (
            <div>
              <strong>Website:</strong> 
              <a href={club.website_url} target="_blank" rel="noopener noreferrer">
                {club.website_url}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Social Links */}
      {club.social_links && Object.keys(club.social_links).length > 0 && (
        <div className="club-social">
          <h2>Follow Us</h2>
          <div className="social-links">
            {Object.entries(club.social_links).map(([platform, url]) => (
              <a 
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={`social-link ${platform}`}
              >
                {platform}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Active Recruitment Campaigns */}
      {recruitments.length > 0 && (
        <div className="club-recruitments">
          <h2>Join Our Club</h2>
          <div className="recruitment-campaigns">
            {recruitments.map(campaign => (
              <RecruitmentCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Recruitment Campaign Card
const RecruitmentCard = ({ campaign }) => (
  <div className="recruitment-card">
    <h3>{campaign.title}</h3>
    <p>{campaign.description}</p>
    <div className="campaign-dates">
      <span>Start: {new Date(campaign.start_date).toLocaleDateString()}</span>
      <span>End: {new Date(campaign.end_date).toLocaleDateString()}</span>
    </div>
    <div className="campaign-requirements">
      <strong>Requirements:</strong>
      <ul>
        {campaign.requirements.map((req, index) => (
          <li key={index}>{req}</li>
        ))}
      </ul>
    </div>
    <button className="apply-btn">
      Apply Now
    </button>
  </div>
);

export default ClubDetail;
```

---

## Error Handling

### Global Error Handler
```javascript
// src/utils/errorHandler.js
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.message || 'Invalid request';
      case 401:
        return 'Please log in to continue';
      case 403:
        return 'You do not have permission to perform this action';
      case 404:
        return 'Resource not found';
      case 429:
        return 'Too many requests. Please try again later';
      case 500:
        return 'Server error. Please try again later';
      default:
        return data.message || 'An error occurred';
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection';
  } else {
    // Other error
    return 'An unexpected error occurred';
  }
};
```

### Loading States Management
```javascript
// src/hooks/useApi.js
import { useState } from 'react';
import { handleApiError } from '../utils/errorHandler';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeApi = async (apiFunction, ...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, executeApi, setError };
};
```

---

## Conclusion

Tài liệu này cung cấp hướng dẫn chi tiết để Frontend kết nối với Backend cho các User Stories từ US001 đến US008. Các điểm chính cần lưu ý:

1. **API Gateway**: Tất cả requests từ Frontend phải đi qua Kong API Gateway tại `http://localhost:8000`
2. **Authentication**: Sử dụng JWT tokens với Bearer authentication
3. **Error Handling**: Xử lý lỗi một cách nhất quán và thông báo rõ ràng cho user
4. **Loading States**: Hiển thị trạng thái loading khi thực hiện API calls
5. **Validation**: Validate dữ liệu ở cả Frontend và Backend
6. **Security**: Sử dụng HTTPS trong production và lưu trữ tokens an toàn

Hãy đảm bảo test kỹ lưỡng các tính năng và xử lý các edge cases một cách phù hợp.
