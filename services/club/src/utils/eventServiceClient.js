const http = require('http');
const https = require('https');
const config = require('../config');

class EventServiceClient {
  constructor() {
    // Priority: ENV variable > Docker service name > localhost fallback
    const eventServiceUrl = process.env.EVENT_SERVICE_URL || 
                           (process.env.NODE_ENV === 'development' ? 'http://event-service:3003' : 'http://localhost:3003');
    
    const url = new URL(eventServiceUrl);
    this.hostname = url.hostname;
    this.port = url.port || (url.protocol === 'https:' ? 443 : 80);
    this.protocol = url.protocol === 'https:' ? 'https' : 'http';
    this.timeout = 5000;
    
    console.log(`Event service configured: ${this.protocol}://${this.hostname}:${this.port}`);
  }

  /**
   * Make simple HTTP GET request
   * @param {string} path - The API path
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Response data
   */
  async _makeRequest(path, params = {}) {
    return new Promise((resolve, reject) => {
      // Build query string
      const queryString = Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== null)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      const fullPath = queryString ? `${path}?${queryString}` : path;
      
      console.log(`Making request to: http://${this.hostname}:${this.port}${fullPath}`);
      
      const options = {
        hostname: this.hostname,
        port: this.port,
        path: fullPath,
        method: 'GET',
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const protocol = this.protocol === 'https' ? https : http;
      const req = protocol.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              const jsonData = JSON.parse(data);
              resolve(jsonData);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${data}`));
            }
          } catch (parseError) {
            reject(new Error('Invalid JSON response: ' + parseError.message));
          }
        });
      });

      req.on('error', (error) => {
        console.error(`Request error: ${error.message}`);
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  /**
   * Test connection to event service
   */
  async testConnection() {
    try {
      console.log('Testing connection to event service...');
      const response = await this._makeRequest('/health');
      console.log('Event service is reachable:', response);
      return true;
    } catch (error) {
      console.error('Event service is NOT reachable:', error.message);
      return false;
    }
  }

  /**
   * Get published events for a club
   */
  async getPublishedClubEvents(clubId, options = {}) {
    try {
      console.log(`Fetching published events for club: ${clubId}`);
      const response = await this._makeRequest(`/api/clubs/${clubId}/events`, {
        status: 'published',
        limit: 10
      });
      return response?.data || [];
    } catch (error) {
      console.error('Error fetching published club events:', error.message);
      return [];
    }
  }

  /**
   * Get upcoming events for a club
   */
  async getUpcomingClubEvents(clubId, requestContext = {}) {
    try {
      console.log(`Fetching upcoming events for club: ${clubId}`);
      const response = await this._makeRequest(`/api/clubs/${clubId}/events`, {
        status: 'upcoming',
        limit: 5
      });
      return response?.data || [];
    } catch (error) {
      console.error('Error fetching upcoming club events:', error.message);
      return [];
    }
  }

  /**
   * Get event statistics for a club
   */
  async getEventStatistics(clubId, requestContext = {}) {
    try {
      console.log(`Fetching event statistics for club: ${clubId}`);
      const response = await this._makeRequest(`/api/clubs/${clubId}/events`, {
        page: 1,
        limit: 1
      });

      const total_events = response?.meta?.total || 0;
      return {
        total_events,
        upcoming_events: 0,
        past_events: total_events
      };
    } catch (error) {
      console.error('Error fetching event statistics:', error.message);
      return {
        total_events: 0,
        upcoming_events: 0,
        past_events: 0
      };
    }
  }
}

module.exports = new EventServiceClient();