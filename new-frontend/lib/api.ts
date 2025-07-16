import config from '@/config';

/**
 * HTTP response interface
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  status: number;
}

/**
 * API error interface
 */
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

/**
 * Request options interface
 */
export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: any;
  timeout?: number;
  skipAuth?: boolean;
}

/**
 * Get JWT token from localStorage
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(config.jwt.storageKey);
};

/**
 * Set JWT token to localStorage
 */
export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(config.jwt.storageKey, token);
};

/**
 * Remove JWT token from localStorage
 */
export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(config.jwt.storageKey);
  localStorage.removeItem(config.jwt.refreshStorageKey);
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(config.jwt.refreshStorageKey);
};

/**
 * Set refresh token to localStorage
 */
export const setRefreshToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(config.jwt.refreshStorageKey, token);
};

/**
 * Create AbortController with timeout
 */
const createTimeoutController = (timeout: number): AbortController => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);
  return controller;
};

/**
 * Build full URL
 */
const buildUrl = (endpoint: string): string => {
  return `${config.api.baseUrl}${endpoint}`;
};

/**
 * Prepare request headers
 */
const prepareHeaders = (options: RequestOptions = {}): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if not skipped and token exists
  if (!options.skipAuth) {
    const token = getToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Handle API response
 */
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  
  let data: any;
  try {
    data = isJson ? await response.json() : await response.text();
  } catch (error) {
    data = null;
  }

  const apiResponse: ApiResponse<T> = {
    data: data?.data || data,
    message: data?.message,
    success: response.ok,
    status: response.status,
  };

  if (!response.ok) {
    const error: ApiError = {
      message: data?.message || `HTTP Error ${response.status}`,
      status: response.status,
      code: data?.code,
      details: data?.details || data,
    };
    throw error;
  }

  return apiResponse;
};

/**
 * Generic API request function
 */
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  const {
    body,
    timeout = config.api.timeout,
    ...fetchOptions
  } = options;

  const controller = createTimeoutController(timeout);
  const url = buildUrl(endpoint);
  const headers = prepareHeaders(options);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    return await handleResponse<T>(response);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw {
        message: 'Request timeout',
        status: 408,
        code: 'TIMEOUT',
      } as ApiError;
    }

    // If it's already an ApiError, re-throw
    if (error.status && error.message) {
      throw error as ApiError;
    }

    // Network or other errors
    throw {
      message: error.message || 'Network error',
      status: 0,
      code: 'NETWORK_ERROR',
      details: error,
    } as ApiError;
  }
};

/**
 * Convenience methods for different HTTP verbs
 */
export const api = {
  get: <T = any>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T = any>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
