const { User, RefreshToken, PasswordResetToken } = require('../models');
const jwtUtil = require('../utils/jwt');
const publisher = require('../events/publisher');
const logger = require('../config/logger');
const config = require('../config');
const userSyncService = require('./userSyncService');
const {
  AppError,
  NotFoundError,
  ValidationError,
  ConflictError,
  InvalidCredentialsError,
  AccountLockedError,
  EmailNotVerifiedError,
  EmailAlreadyExistsError,
  PasswordResetTokenInvalidError,
  RefreshTokenExpiredError,
  EmailVerificationTokenError,
  WeakPasswordError,
  AuthorizationError
} = require('../utils/errors');

class AuthService {
  constructor() {
    const securityConfig = config.getSecurityConfig();
    this.maxFailedAttempts = securityConfig.maxLoginAttempts;
    this.lockTime = securityConfig.accountLockTimeMs;
  }

  /**
   * Register a new user with email verification
   * @param {Object} userData - User registration data
   * @returns {Object} Registration success message
   */
  async register(userData) {
    const { email, full_name, password } = userData;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
      if (existingUser) {
        throw new EmailAlreadyExistsError();
      }

      // Create the user with email_verified = false
      const user = await User.createUser({
        email: email.toLowerCase(),
        full_name,
        password,
        role: 'USER'
      });

      // Generate email verification token (expires in 1 hour)
      const verificationToken = jwtUtil.generateEmailVerificationToken(user.id, user.email);

      // Build verification URL
      const frontendConfig = config.getFrontendConfig();
      const verificationLink = `${frontendConfig.baseUrl}/verify-email?token=${verificationToken}`;

      // Publish email verification event to RabbitMQ
      await publisher.publishEmailVerificationEvent({
        userId: user.id,
        email: user.email,
        link: verificationLink,
        fullName: user.full_name
      });

      logger.info('User registered successfully, verification email sent', {
        userId: user.id,
        email: user.email,
        role: user.role
      });

      return {
        message: 'Registration successful. Please check your email and click the verification link to activate your account.',
        email: user.email
      };
    } catch (error) {
      logger.error('User registration failed:', error);
      throw error;
    }
  }

  /**
   * Verify email using verification token
   * @param {string} token - Email verification JWT token
   * @returns {Object} Verification result
   */
  async verifyEmail(token) {
    try {
      // Verify and decode the token
      const decoded = jwtUtil.verifyEmailVerificationToken(token);
      
      // Find the user
      const user = await User.findByPk(decoded.userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Check if email is already verified
      if (user.email_verified) {
        return {
          message: 'Email is already verified. You can now login.',
          alreadyVerified: true
        };
      }

      // Verify that the token email matches the user's current email
      if (user.email !== decoded.email) {
        throw new EmailVerificationTokenError('Email verification token is invalid or outdated');
      }

      // Mark email as verified
      await user.update({ 
        email_verified: true,
        email_verified_at: new Date()
      });

      // Sync user creation with user service after email verification
      const syncResult = await userSyncService.syncUserCreation({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone || null,
        avatar_url: user.avatar_url || null
      });

      if (syncResult.success !== false) {
        logger.info('User synced with user service after email verification', {
          userId: user.id,
          email: user.email
        });
      } else {
        logger.warn('Failed to sync user with user service, but email verification succeeded', {
          userId: user.id,
          email: user.email,
          syncError: syncResult.error
        });
      }

      logger.info('Email verified successfully', {
        userId: user.id,
        email: user.email
      });

      return {
        message: 'Email verified successfully. You can now login to your account.',
        verified: true
      };
    } catch (error) {
      logger.error('Email verification failed:', error);
      throw error;
    }
  }

  /**
   * Authenticate user login
   * @param {Object} credentials - Login credentials
   * @returns {Object} User and tokens
   */
  async login(credentials) {
    const { email, password, rememberMe = false, ip, userAgent } = credentials;

    try {
      // Find user with password
      const user = await User.findByEmail(email);
      if (!user) {
        throw new InvalidCredentialsError();
      }

      // Check if account is locked
      if (user.isLocked()) {
        throw new AccountLockedError();
      }

      // Check if email is verified
      if (!user.email_verified) {
        throw new EmailNotVerifiedError('Please verify your email address before logging in. Check your inbox for the verification link.');
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        await user.incrementFailedAttempts();
        throw new InvalidCredentialsError();
      }

      // Reset failed attempts on successful login
      await user.resetFailedAttempts();

      // Generate tokens
      const { accessToken, refreshToken } = jwtUtil.generateTokenPair(user);

      // Store refresh token in database
      const refreshTokenRecord = await RefreshToken.createToken(user.id, {
        userAgent,
        ip,
        rememberMe
      });

      logger.info('User logged in successfully', {
        userId: user.id,
        email: user.email,
        ip
      });

      return {
        user: user.toJSON(),
        accessToken,
        refreshToken: refreshTokenRecord.token
      };
    } catch (error) {
      logger.error('User login failed:', error, { email });
      throw error;
    }
  }

  /**
   * Logout user and invalidate tokens
   * @param {string} refreshToken - Refresh token to invalidate
   * @param {string} userId - User ID from gateway headers
   */
  async logout(refreshToken, userId) {
    try {
      if (refreshToken) {
        // Find and revoke the specific refresh token
        const tokenRecord = await RefreshToken.findValidToken(refreshToken);
        if (tokenRecord && tokenRecord.user_id === userId) {
          await tokenRecord.revoke();
        }
      } else {
        // Revoke all user tokens if no specific token provided
        await RefreshToken.revokeAllUserTokens(userId);
      }

      logger.info('User logged out successfully', { userId });

      return { message: 'Logged out successfully' };
    } catch (error) {
      logger.error('Logout failed:', error, { userId });
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Current refresh token
   * @returns {Object} New token pair
   */
  async refreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw new RefreshTokenExpiredError('Refresh token not provided');
      }

      // Find and validate refresh token
      const tokenRecord = await RefreshToken.findValidToken(refreshToken);
      if (!tokenRecord || !tokenRecord.isValid()) {
        throw new RefreshTokenExpiredError();
      }

      const user = tokenRecord.user;
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Generate new token pair
      const { accessToken, refreshToken: newRefreshToken } = jwtUtil.generateTokenPair(user);

      // Create new refresh token record
      const newRefreshTokenRecord = await RefreshToken.createToken(user.id, tokenRecord.device_info);

      // Revoke old refresh token
      await tokenRecord.revoke();

      logger.info('Token refreshed successfully', {
        userId: user.id,
        oldTokenId: tokenRecord.id
      });

      return {
        user: user.toJSON(),
        accessToken,
        refreshToken: newRefreshTokenRecord.token
      };
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Get current user information
   * @param {string} userId - User ID from gateway headers
   * @returns {Object} User information
   */
  async getCurrentUser(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      logger.debug('Retrieved current user', { userId });

      return user.toJSON();
    } catch (error) {
      logger.error('Get current user failed:', error, { userId });
      throw error;
    }
  }

  /**
   * Initiate password reset process
   * @param {string} email - User email
   * @param {string} ip - Client IP address
   * @returns {Object} Success message
   */
  async forgotPassword(email, ip) {
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists, but log for security monitoring
        logger.warn('Password reset requested for non-existent email', { email, ip });
        return { message: 'If the email exists, a reset link has been sent' };
      }

      // Generate reset token
      const resetToken = await PasswordResetToken.createToken(user.id, ip);

      // Build password reset URL
      const frontendConfig = config.getFrontendConfig();
      const resetLink = `${frontendConfig.url}/reset-password?token=${resetToken.token}`;

      // Publish password reset email event to notification service
      await publisher.publishPasswordResetEvent({
        userId: user.id,
        email: user.email,
        fullName: user.full_name,
        link: resetLink
      });

      logger.info('Password reset initiated', {
        userId: user.id,
        email: user.email,
        ip
      });

      return { message: 'If the email exists, a reset link has been sent' };
    } catch (error) {
      logger.error('Password reset initiation failed:', error, { email });
      throw error;
    }
  }

  /**
   * Reset user password using reset token
   * @param {string} token - Password reset token
   * @param {string} newPassword - New password
   * @param {string} ip - Client IP address
   * @returns {Object} Success message
   */
  async resetPassword(token, newPassword, ip) {
    try {
      // Find and validate reset token
      const resetTokenRecord = await PasswordResetToken.findValidToken(token);
      if (!resetTokenRecord || !resetTokenRecord.isValid()) {
        throw new PasswordResetTokenInvalidError();
      }

      const user = resetTokenRecord.user;
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Update user password
      user.password_hash = newPassword; // Will be hashed by model hook
      await user.save();

      // Mark reset token as used
      await resetTokenRecord.markAsUsed(ip);

      // Revoke all refresh tokens for security
      await RefreshToken.revokeAllUserTokens(user.id);

      logger.info('Password reset completed', {
        userId: user.id,
        email: user.email,
        ip
      });

      return { message: 'Password reset successfully' };
    } catch (error) {
      logger.error('Password reset failed:', error);
      throw error;
    }
  }

  /**
   * Change user password
   * @param {string} userId - User ID from gateway headers
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Object} Success message
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.scope('withPassword').findByPk(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Verify current password
      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) {
        throw new InvalidCredentialsError('Current password is incorrect');
      }

      // Update password
      user.password_hash = newPassword; // Will be hashed by model hook
      await user.save();

      // Revoke all refresh tokens for security
      await RefreshToken.revokeAllUserTokens(userId);

      logger.info('Password changed successfully', {
        userId: user.id,
        email: user.email
      });

      return { message: 'Password changed successfully' };
    } catch (error) {
      logger.error('Password change failed:', error, { userId });
      throw error;
    }
  }

  /**
   * Cleanup expired tokens
   */
  async cleanupExpiredTokens() {
    try {
      const [refreshCount, resetCount] = await Promise.all([
        RefreshToken.cleanupExpiredTokens(),
        PasswordResetToken.cleanupExpiredTokens()
      ]);

      logger.info('Token cleanup completed', {
        expiredRefreshTokens: refreshCount,
        expiredResetTokens: resetCount
      });

      return { refreshCount, resetCount };
    } catch (error) {
      logger.error('Token cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Get service health status
   * @returns {Object} Health status
   */
  async getHealthStatus() {
    try {
      const dbHealth = await this.checkDatabaseHealth();
      const rabbitmqHealth = publisher.getConnectionStatus();

      const isHealthy = dbHealth.connected && rabbitmqHealth.connected;

      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        version: config.get('SERVICE_VERSION'),
        uptime: process.uptime(),
        services: {
          database: dbHealth,
          rabbitmq: rabbitmqHealth
        },
        note: 'Email notifications are handled by dedicated notification service'
      };
    } catch (error) {
      logger.error('Health check failed:', error);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  /**
   * Check database connectivity
   * @returns {Object} Database health status
   */
  async checkDatabaseHealth() {
    try {
      await User.findOne({ limit: 1 });
      return { connected: true, status: 'healthy' };
    } catch (error) {
      return { connected: false, status: 'error', error: error.message };
    }
  }

  /**
   * Delete user's own account (self-deletion)
   * @param {string} userId - User ID from gateway headers
   * @param {string} password - Password confirmation
   * @returns {Object} Success message
   */
  async deleteAccount(userId, password) {
    try {
      const user = await User.scope('withPassword').findByPk(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        throw new InvalidCredentialsError('Password is incorrect');
      }

      // Prevent admin self-deletion for security
      if (user.role === 'ADMIN') {
        throw new AuthorizationError('Admin accounts cannot be self-deleted for security reasons');
      }

      // Log deletion for audit trail
      logger.warn('User account self-deleted', {
        userId: user.id,
        email: user.email,
        role: user.role,
        deletedAt: new Date().toISOString(),
        action: 'self-deletion'
      });

      // Clean up all user-related data
      await Promise.all([
        RefreshToken.revokeAllUserTokens(userId),
        PasswordResetToken.destroy({ where: { user_id: userId } })
      ]);

      // Soft delete user (marks as deleted but keeps record for audit)
      await user.destroy();

      return { message: 'Account deleted successfully' };
    } catch (error) {
      logger.error('Account deletion failed:', error, { userId });
      throw error;
    }
  }

  /**
   * Delete user account (admin only)
   * @param {string} targetUserId - ID of user to delete
   * @returns {Object} Success message
   */
  async deleteUser(targetUserId) {
    try {
      const user = await User.findByPk(targetUserId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Log deletion for audit trail
      logger.warn('User account deleted by admin', {
        targetUserId: user.id,
        targetEmail: user.email,
        targetRole: user.role,
        deletedAt: new Date().toISOString(),
        action: 'admin-deletion'
      });

      // Clean up all user-related data
      await Promise.all([
        RefreshToken.revokeAllUserTokens(targetUserId),
        PasswordResetToken.destroy({ where: { user_id: targetUserId } })
      ]);

      // Soft delete user
      await user.destroy();

      return { message: 'User account deleted successfully' };
    } catch (error) {
      logger.error('User deletion failed:', error, { targetUserId });
      throw error;
    }
  }
}

module.exports = new AuthService(); 