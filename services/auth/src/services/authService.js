const { User, RefreshToken, PasswordResetToken } = require('../models');
const jwtUtil = require('../utils/jwt');
const publisher = require('../events/publisher');
const logger = require('../config/logger');
const config = require('../config');
// userSyncService replaced with RabbitMQ events - see publisher.publishUserCreated/Updated
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
        role: 'user'
      });

      // Test-only shortcut: auto-verify emails if enabled
      if (config.get('AUTO_VERIFY_EMAILS')) {
        // Promote roles for known test accounts
        let newRole = 'user';
        if (email.toLowerCase().startsWith('admin')) newRole = 'admin';
        await user.update({ 
          email_verified: true,
          email_verified_at: new Date(),
          role: newRole
        });

        logger.info('User registered and auto-verified (test mode)', {
          userId: user.id,
          email: user.email
        });

        return {
          message: 'Registration successful (auto-verified for tests).',
          email: user.email,
          user: user.toJSON()
        };
      }

      // Normal flow: send verification email
      const verificationToken = jwtUtil.generateEmailVerificationToken(user.id, user.email);
      const frontendConfig = config.getFrontendConfig();
      const verificationLink = `${frontendConfig.baseUrl}/verify-email?token=${verificationToken}`;

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
        email: user.email,
        user: user.toJSON()
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
      let decoded;
      try {
        decoded = jwtUtil.verifyEmailVerificationToken(token);
      } catch (jwtError) {
        // Convert JWT errors to proper auth errors
        if (jwtError.message.includes('expired')) {
          throw new EmailVerificationTokenError('Email verification token has expired');
        } else if (jwtError.message.includes('Invalid') || jwtError.message.includes('invalid')) {
          throw new EmailVerificationTokenError('Invalid email verification token');
        } else {
          throw new EmailVerificationTokenError('Email verification token is invalid');
        }
      }
      
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

      // Publish user.created event to RabbitMQ
      // Club-service and event-service will consume this to cache user data
      await publisher.publishUserCreated(user);

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
        if (config.get('AUTO_VERIFY_EMAILS')) {
          await user.update({ 
            email_verified: true,
            email_verified_at: new Date()
          });
        } else {
          throw new EmailNotVerifiedError('Please verify your email address before logging in. Check your inbox for the verification link.');
        }
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        await user.incrementFailedAttempts();
        logger.warn('Invalid login attempt', { email });
        throw new InvalidCredentialsError();
      }

      // Reset failed attempts on successful login
      await user.resetFailedAttempts();

      // Generate tokens
      const { accessToken, refreshToken } = jwtUtil.generateTokenPair(user);

      // Store refresh token in database
      const refreshTokenRecord = await RefreshToken.createToken(user.id);

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
      const newRefreshTokenRecord = await RefreshToken.createToken(user.id);

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
   * Get all users (admin only)
   * @param {Object} options - Query options
   * @returns {Object} Users list with pagination
   */
  async getAllUsers(options = {}) {
    try {
      const { page = 1, limit = 10, search, role } = options;
      
      // Build where clause
      const whereClause = {};
      
      if (role) {
        whereClause.role = role;
      }
      
      if (search) {
        const { Op } = require('sequelize');
        whereClause[Op.or] = [
          { full_name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      // Only include non-deleted users
      whereClause.deleted_at = null;
      
      const offset = (page - 1) * limit;
      
      const { count, rows } = await User.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        order: [['created_at', 'DESC']],
        attributes: ['id', 'email', 'full_name', 'role', 'email_verified', 'created_at']
      });
      
      const users = rows.map(user => user.toJSON());
      
      const pagination = {
        current_page: parseInt(page, 10),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit, 10)
      };
      
      logger.debug('Retrieved users list', { 
        page, 
        limit, 
        search, 
        role, 
        total: count 
      });
      
      return {
        users,
        pagination
      };
    } catch (error) {
      logger.error('Get users failed:', error);
      throw error;
    }
  }

  /**
   * Get user by ID (admin only)
   * @param {string} userId - User ID
   * @returns {Object} User data
   */
  async getUserById(userId) {
    try {
      const user = await User.findOne({
        where: { 
          id: userId,
          deleted_at: null
        },
        attributes: ['id', 'email', 'full_name', 'role', 'email_verified', 'created_at', 'updated_at']
      });
      
      if (!user) {
        return null;
      }
      
      logger.debug('Retrieved user by ID', { userId });
      
      return user.toJSON();
    } catch (error) {
      logger.error('Get user by ID failed:', error);
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
      if (user.role === 'admin') {
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

      // Publish user.deleted event
      await publisher.publishUserDeleted(userId);

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

      // Publish user.deleted event
      await publisher.publishUserDeleted(targetUserId);

      return { message: 'User account deleted successfully' };
    } catch (error) {
      logger.error('User deletion failed:', error, { targetUserId });
      throw error;
    }
  }

  /**
   * Get user profile information
   * @param {string} userId - User ID
   * @returns {Object} User profile data
   */
  async getUserProfile(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: { 
          exclude: ['password_hash', 'failed_login_attempts', 'locked_until'] 
        }
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      logger.info('User profile retrieved', { userId });
      return user;
    } catch (error) {
      logger.error('Failed to get user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile information
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile data to update
   * @returns {Object} Updated user profile
   */
  async updateProfile(userId, profileData) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Allowed profile fields for update
      const allowedFields = [
        'full_name', 'phone', 'bio', 'date_of_birth', 
        'address', 'social_links', 'profile_picture_url',
        'gender'
      ];

      // Filter only allowed fields
      const updateData = {};
      Object.keys(profileData).forEach(key => {
        if (allowedFields.includes(key)) {
          updateData[key] = profileData[key];
        }
      });

      // Check if phone number is already taken by another user
      if (updateData.phone && updateData.phone !== user.phone) {
        const existingUser = await User.findOne({ 
          where: { phone: updateData.phone } 
        });
        if (existingUser && existingUser.id !== userId) {
          throw new ConflictError('Phone number already exists');
        }
      }

      await user.update(updateData);
      
      // Return updated user without sensitive fields
      const updatedUser = await User.findByPk(userId, {
        attributes: { 
          exclude: ['password_hash', 'failed_login_attempts', 'locked_until'] 
        }
      });

      // Publish user.updated event to RabbitMQ
      // Club-service and event-service will consume this to update cached user data
      await publisher.publishUserUpdated(updatedUser, Object.keys(updateData));

      logger.info('User profile updated', { userId, updatedFields: Object.keys(updateData) });
      return updatedUser;
    } catch (error) {
      logger.error('Failed to update user profile:', error);
      throw error;
    }
  }

  /**
   * Update user's profile picture
   * @param {string} userId - User ID
   * @param {string} imageUrl - New profile picture URL
   * @returns {Object} Updated user profile
   */
  async updateProfilePicture(userId, imageUrl) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      await user.update({ profile_picture_url: imageUrl });

      logger.info('Profile picture updated', { userId });
      return { 
        message: 'Profile picture updated successfully',
        profile_picture_url: imageUrl 
      };
    } catch (error) {
      logger.error('Failed to update profile picture:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();