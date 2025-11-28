const http = require('http');
const https = require('https');
const config = require('../config');
const logger = require('./logger');

class EventServiceClient {
  constructor() {
    // Priority: ENV variable > Docker service name > localhost fallback
    const eventServiceUrl = process.env.EVENT_SERVICE_URL ||
                           (process.env.NODE_ENV === 'development' ? 'http://event-service:3003' : 'http://localhost:3003');

    const url = new URL(eventServiceUrl);
    this.hostname = url.hostname;
    this.protocol = url.protocol === 'https:' ? 'https' : 'http';
    // Only set port if explicitly provided in URL
    this.port = url.port || undefined;
    this.timeout = 5000;

    logger.info('Event service configured', {
      url: `${this.protocol}://${this.hostname}${this.port ? ':' + this.port : ''}`
    });
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

      logger.debug('Making request to event service', {
        url: `${this.protocol}://${this.hostname}${this.port ? ':' + this.port : ''}${fullPath}`
      });

      const options = {
        hostname: this.hostname,
        path: fullPath,
        method: 'GET',
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
          'x-api-gateway-secret': process.env.API_GATEWAY_SECRET || 'club-mgmt-internal-secret-2024'
        }
      };

      // Only add port if explicitly provided
      if (this.port) {
        options.port = this.port;
      }

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
        logger.error('Event service request error', { error: error.message });
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
      logger.debug('Testing connection to event service...');
      const response = await this._makeRequest('/health');
      logger.info('Event service is reachable', { response });
      return true;
    } catch (error) {
      logger.error('Event service is NOT reachable', { error: error.message });
      return false;
    }
  }

  /**
   * Get published events for a club
   */
  async getPublishedClubEvents(clubId, options = {}) {
    try {
      logger.debug('Fetching published events for club', { clubId });
      const response = await this._makeRequest(`/api/clubs/${clubId}/events`, {
        status: 'published',
        limit: 10,
        ...options
      });
      return response?.data || [];
    } catch (error) {
      logger.error('Error fetching published club events', { clubId, error: error.message });
      return [];
    }
  }

  /**
   * Get upcoming events for a club
   */
  async getUpcomingClubEvents(clubId, requestContext = {}) {
    try {
      logger.debug('Fetching upcoming events for club', { clubId });
      const response = await this._makeRequest(`/api/clubs/${clubId}/events`, {
        status: 'published',
        limit: 10
      });

      // Filter events with future start_date on client side
      const currentDate = new Date();
      const allEvents = response?.data || [];

      return allEvents.filter(event => {
        const eventDate = new Date(event.start_date || event.date);
        return eventDate > currentDate;
      });
    } catch (error) {
      logger.error('Error fetching upcoming club events', { clubId, error: error.message });
      return [];
    }
  }

  /**
   * Get event statistics for a club
   */
  async getEventStatistics(clubId, requestContext = {}) {
    try {
      logger.debug('Fetching event statistics for club', { clubId });

      // Get published and completed events separately since cron job maintains correct statuses
      const [publishedResponse, completedResponse] = await Promise.all([
        this._makeRequest(`/api/clubs/${clubId}/events`, {
          status: 'published',
          page: 1,
          limit: 100
        }).catch(() => ({ data: [], meta: { total: 0 } })),

        this._makeRequest(`/api/clubs/${clubId}/events`, {
          status: 'completed',
          page: 1,
          limit: 100
        }).catch(() => ({ data: [], meta: { total: 0 } }))
      ]);

      const publishedEvents = publishedResponse?.data || [];
      const completedEvents = completedResponse?.data || [];

      // Since cron job maintains accurate statuses, no need for client-side date filtering
      const published_events = publishedEvents.length;
      const completed_events = completedEvents.length;
      const total_events = published_events + completed_events;

      // For upcoming events, filter published events by future start_date (client-side)
      const currentDate = new Date();
      const upcoming_events = publishedEvents.filter(event => {
        const eventStartDate = new Date(event.start_date || event.date);
        return eventStartDate > currentDate;
      }).length;

      return {
        total_events,
        published_events,
        completed_events,
        upcoming_events, // Subset of published events with future start_date
        past_events: completed_events // Maintain backward compatibility
      };
    } catch (error) {
      logger.error('Error fetching event statistics', { clubId, error: error.message });
      return {
        total_events: 0,
        published_events: 0,
        completed_events: 0,
        upcoming_events: 0,
        past_events: 0
      };
    }
  }

  /**
   * Get completed events for a club
   * @param {string} clubId - Club ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of completed events
   */
  async getCompletedClubEvents(clubId, options = {}) {
    try {
      logger.debug('Fetching completed events for club', { clubId });

      // Get completed events by status - cron job maintains accurate statuses
      const response = await this._makeRequest(`/api/clubs/${clubId}/events`, {
        status: 'completed',
        limit: 20,
        ...options
      });

      return response?.data || [];
    } catch (error) {
      logger.error('Error fetching completed club events', { clubId, error: error.message });
      return [];
    }
  }
}

module.exports = new EventServiceClient();