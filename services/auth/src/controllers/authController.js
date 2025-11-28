const authService = require('../services/authService');
const logger = require('../config/logger');
const config = require('../config');
const { asyncErrorHandler } = require('../middlewares/errorHandler');

class AuthController {
  /**
   * Register a new user
   * @route POST /api/auth/register
   */
  register = asyncErrorHandler(async (req, res) => {
    const { email, full_name, password, role } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    const result = await authService.register({
      email,
      full_name,
      password,
      role,
      ip,
      userAgent
    });

    res.status(201).json({
      success: true,
      message: result.message,
      data: {
        email: result.email,
        user: result.user
      }
    });
  });

  /**
   * Verify email using verification token
   * @route POST /api/auth/verify-email
   */
  verifyEmail = asyncErrorHandler(async (req, res) => {
    const { token } = req.body;

    const result = await authService.verifyEmail(token);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        verified: result.verified || false,
        alreadyVerified: result.alreadyVerified || false
      }
    });
  });

  /**
   * User login
   * @route POST /api/auth/login
   */
  login = asyncErrorHandler(async (req, res) => {
    const { email, password, rememberMe } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    const result = await authService.login({
      email,
      password,
      rememberMe,
      ip,
      userAgent
    });

    // Set refresh token as HTTP-only cookie
    const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000; // 30 days or 7 days
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: config.isProduction(),
      sameSite: config.isProduction() ? 'none' : 'strict', // Allow cross-site cookies in production
      maxAge: cookieMaxAge
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        accessToken: result.accessToken
      }
    });
  });

  /**
   * User logout
   * @route POST /api/auth/logout
   */
  logout = asyncErrorHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    const userId = req.user?.id; // From API Gateway headers

    await authService.logout(refreshToken, userId);

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  });

  /**
   * Refresh access token
   * @route POST /api/auth/refresh
   */
  refreshToken = asyncErrorHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    const result = await authService.refreshToken(refreshToken);

    // Set new refresh token as HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: config.isProduction(),
      sameSite: config.isProduction() ? 'none' : 'strict', // Allow cross-site cookies in production
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user: result.user,
        accessToken: result.accessToken
      }
    });
  });

  /**
   * Get current user
   * @route GET /api/auth/me
   */
  getCurrentUser = asyncErrorHandler(async (req, res) => {
    const userId = req.user.id; // From API Gateway headers

    const user = await authService.getCurrentUser(userId);

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: { user }
    });
  });

  /**
   * Get all users (admin only)
   * @route GET /api/auth/users
   */
  getAllUsers = asyncErrorHandler(async (req, res) => {
    const { page = 1, limit = 10, search, role } = req.query;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search,
      role
    };

    const result = await authService.getAllUsers(options);

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: result.users,
        pagination: result.pagination
      }
    });
  });

  /**
   * Get user by ID (admin only)
   * @route GET /api/auth/users/:id
   */
  getUserById = asyncErrorHandler(async (req, res) => {
    const { id } = req.params;

    const user = await authService.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: { user }
    });
  });

  /**
   * Forgot password
   * @route POST /api/auth/forgot-password
   */
  forgotPassword = asyncErrorHandler(async (req, res) => {
    const { email } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    const result = await authService.forgotPassword(email, ip);

    res.status(200).json({
      success: true,
      message: result.message
    });
  });

  /**
   * Reset password
   * @route POST /api/auth/reset-password
   */
  resetPassword = asyncErrorHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    const result = await authService.resetPassword(token, newPassword, ip);

    res.status(200).json({
      success: true,
      message: result.message
    });
  });

  /**
   * Change password
   * @route POST /api/auth/change-password
   */
  changePassword = asyncErrorHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // From API Gateway headers

    const result = await authService.changePassword(userId, currentPassword, newPassword);

    // Clear all refresh token cookies for security
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: result.message
    });
  });

  /**
   * Health check
   * @route GET /api/auth/health
   */
  health = asyncErrorHandler(async (req, res) => {
    const healthStatus = await authService.getHealthStatus();

    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;

    res.status(statusCode).json({
      success: healthStatus.status === 'healthy',
      ...healthStatus
    });
  });

  /**
   * Liveness probe
   * @route GET /api/auth/liveness
   */
  liveness = asyncErrorHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  /**
   * Readiness probe
   * @route GET /api/auth/readiness
   */
  readiness = asyncErrorHandler(async (req, res) => {
    try {
      const dbHealth = await authService.checkDatabaseHealth();

      if (dbHealth.connected) {
        res.status(200).json({
          success: true,
          status: 'ready',
          timestamp: new Date().toISOString(),
          services: {
            database: dbHealth
          }
        });
      } else {
        res.status(503).json({
          success: false,
          status: 'not ready',
          timestamp: new Date().toISOString(),
          services: {
            database: dbHealth
          }
        });
      }
    } catch (error) {
      logger.error('Readiness check failed:', error);
      res.status(503).json({
        success: false,
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  });

  /**
   * Cleanup expired tokens (admin endpoint)
   * @route POST /api/auth/cleanup
   */
  cleanup = asyncErrorHandler(async (req, res) => {
    const result = await authService.cleanupExpiredTokens();

    res.status(200).json({
      success: true,
      message: 'Token cleanup completed',
      data: result
    });
  });

  /**
   * Delete own account (self-deletion)
   * @route DELETE /api/auth/me
   */
  deleteAccount = asyncErrorHandler(async (req, res) => {
    const { password } = req.body;
    const userId = req.user.id; // From API Gateway headers

    const result = await authService.deleteAccount(userId, password);

    // Clear refresh token cookie since account is deleted
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: result.message
    });
  });

  /**
   * Delete user account (admin only)
   * @route DELETE /api/auth/users/:id
   */
  deleteUser = asyncErrorHandler(async (req, res) => {
    const { id } = req.params;

    const result = await authService.deleteUser(id);

    res.status(200).json({
      success: true,
      message: result.message
    });
  });

  /**
   * Get user profile
   * @route GET /api/auth/profile
   */
  getProfile = asyncErrorHandler(async (req, res) => {
    const userId = req.user?.id; // From API Gateway headers

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const user = await authService.getUserProfile(userId);

    res.status(200).json({
      success: true,
      data: user
    });
  });

  /**
   * Update user profile
   * @route PUT /api/auth/profile
   */
  updateProfile = asyncErrorHandler(async (req, res) => {
    const userId = req.user?.id; // From API Gateway headers
    const profileData = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const updatedUser = await authService.updateProfile(userId, profileData);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  });

  /**
   * Update profile picture
   * @route PUT /api/auth/profile/picture
   */
  updateProfilePicture = asyncErrorHandler(async (req, res) => {
    const userId = req.user?.id; // From API Gateway headers
    const { profile_picture_url } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!profile_picture_url) {
      return res.status(400).json({
        success: false,
        message: 'Profile picture URL is required'
      });
    }

    const result = await authService.updateProfilePicture(userId, profile_picture_url);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        profile_picture_url: result.profile_picture_url
      }
    });
  });
}

module.exports = new AuthController();