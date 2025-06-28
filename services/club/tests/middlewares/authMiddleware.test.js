const { extractUserFromHeaders } = require('../../src/middlewares/authMiddleware');

describe('Auth Middleware', () => {
  describe('extractUserFromHeaders', () => {
    test('should extract user information from headers', () => {
      // Mock request with headers
      const req = {
        headers: {
          'x-user-id': 'user123',
          'x-user-email': 'user@example.com',
          'x-user-full-name': 'Test User',
          'x-user-roles': 'ADMIN,USER',
          'x-user-email-verified': 'true'
        }
      };

      // Mock response and next
      const res = {};
      const next = jest.fn();

      // Call the middleware
      extractUserFromHeaders(req, res, next);

      // Assert
      expect(req.user).toBeDefined();
      expect(req.user).toEqual({
        id: 'user123',
        email: 'user@example.com',
        fullName: 'Test User',
        roles: ['ADMIN', 'USER'],
        emailVerified: true
      });
      expect(next).toHaveBeenCalled();
    });

    test('should handle missing headers', () => {
      // Mock request with no headers
      const req = {
        headers: {}
      };

      // Mock response and next
      const res = {};
      const next = jest.fn();

      // Call the middleware
      extractUserFromHeaders(req, res, next);

      // Assert
      expect(req.user).toBeDefined();
      expect(req.user).toEqual({
        id: undefined,
        email: undefined,
        fullName: undefined,
        roles: [],
        emailVerified: false
      });
      expect(next).toHaveBeenCalled();
    });

    test('should handle invalid roles format', () => {
      // Mock request with invalid roles format
      const req = {
        headers: {
          'x-user-id': 'user123',
          'x-user-roles': 'invalid-format'
        }
      };

      // Mock response and next
      const res = {};
      const next = jest.fn();

      // Call the middleware
      extractUserFromHeaders(req, res, next);

      // Assert
      expect(req.user).toBeDefined();
      expect(req.user.roles).toEqual(['invalid-format']);
      expect(next).toHaveBeenCalled();
    });
  });
});
