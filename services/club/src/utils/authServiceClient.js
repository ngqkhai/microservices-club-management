const http = require('http');
const https = require('https');

/**
 * Simple HTTP client without external dependencies
 */
class SimpleHttpClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async get(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseURL);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const requestOptions = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: 'GET',
        headers: options.headers || {}
      };

      const req = client.request(requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const response = {
              status: res.statusCode,
              data: JSON.parse(data)
            };
            
            if (res.statusCode >= 400) {
              const error = new Error(`HTTP ${res.statusCode}: ${data}`);
              error.response = response;
              reject(error);
            } else {
              resolve(response);
            }
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }
}

/**
 * Auth Service Client
 * Handles communication with the auth service
 */
class AuthServiceClient {
  constructor() {
    // Use environment variables for service URLs
    this.baseURL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
    this.apiGatewaySecret = process.env.API_GATEWAY_SECRET || 'club-mgmt-internal-secret-2024';
    
    // Create HTTP client instance
    this.client = new SimpleHttpClient(this.baseURL);
  }

  /**
   * Verify if a user exists in the auth database
   * @param {string} userId - The user ID to verify
   * @param {Object} requestContext - Request context with user info
   * @returns {Promise<Object>} User information if exists, null if not found
   */
  async verifyUserExists(userId, requestContext = {}) {
    try {
      const headers = {
        'X-API-Gateway-Secret': this.apiGatewaySecret,
        'X-User-ID': requestContext.userId || 'system-service',
        'X-User-Role': requestContext.userRole || 'admin'
      };
      
      const response = await this.client.get(`/api/auth/users/${userId}`, { headers });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null; // User not found
      }
      
      // Log the error for debugging
      console.error('Auth Service Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        userId
      });
      
      throw new Error(`Failed to verify user existence: ${error.message}`);
    }
  }

  /**
   * Get user details by ID
   * @param {string} userId - The user ID
   * @param {Object} requestContext - Request context with user info
   * @returns {Promise<Object>} User information
   */
  async getUserById(userId, requestContext = {}) {
    try {
      const headers = {
        'x-api-gateway-secret': this.apiGatewaySecret,
        'x-user-id': requestContext.userId || 'system-service',
        'x-user-role': requestContext.userRole || 'admin'
      };
      
      const response = await this.client.get(`/api/auth/users/${userId}`, { headers });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        const notFoundError = new Error('User not found');
        notFoundError.status = 404;
        notFoundError.name = 'USER_NOT_FOUND';
        throw notFoundError;
      }
      
      console.error('Auth Service Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        userId
      });
      
      throw new Error(`Failed to get user details: ${error.message}`);
    }
  }

  /**
   * Get all users (for admin user selection)
   * @param {Object} options - Query options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @param {string} options.search - Search query
   * @param {Object} requestContext - Request context with user info
   * @returns {Promise<Object>} Users list with pagination
   */
  async getAllUsers(options = {}, requestContext = {}) {
    try {
      const { page = 1, limit = 10, search = '' } = options;
      
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      if (search) params.append('search', search);
      
      const headers = {
        'x-api-gateway-secret': this.apiGatewaySecret,
        'x-user-id': requestContext.userId || 'system-service',
        'x-user-role': requestContext.userRole || 'admin'
      };
      
      const response = await this.client.get(`/api/auth/users?${params.toString()}`, { headers });
      return response.data;
    } catch (error) {
      console.error('Auth Service Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        options
      });
      
      throw new Error(`Failed to get users list: ${error.message}`);
    }
  }

  /**
   * Health check for auth service
   * @returns {Promise<boolean>} True if service is healthy
   */
  async healthCheck() {
    try {
      const headers = {
        'x-api-gateway-secret': this.apiGatewaySecret
      };
      
      const response = await this.client.get('/api/auth/health', { headers });
      return response.status === 200;
    } catch (error) {
      console.error('Auth Service Health Check Failed:', error.message);
      return false;
    }
  }
}

// Export singleton instance
module.exports = new AuthServiceClient();
