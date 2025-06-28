/**
 * Middleware to extract user information from request headers
 * Headers are set by API Gateway after JWT verification
 */
const extractUserFromHeaders = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const userEmail = req.headers['x-user-email'];
  const userFullName = req.headers['x-user-full-name'];
  const userRoles = req.headers['x-user-roles'];
  const emailVerified = req.headers['x-user-email-verified'];

  // Parse roles from string to array if present
  let roles = [];
  if (userRoles) {
    try {
      roles = userRoles.split(',').map(role => role.trim());
    } catch (error) {
      console.warn('Failed to parse user roles:', error);
    }
  }

  req.user = {
    id: userId,
    email: userEmail,
    fullName: userFullName,
    roles: roles,
    emailVerified: emailVerified === 'true'
  };

  // For development/testing - log when no user ID is present
  if (!userId && (process.env.NODE_ENV === 'development' || process.env.MOCK_DB === 'true')) {
    console.warn('⚠️ No user ID found in request headers. Authentication may be bypassed in development mode.');
  }

  next();
};

module.exports = {
  extractUserFromHeaders
};
