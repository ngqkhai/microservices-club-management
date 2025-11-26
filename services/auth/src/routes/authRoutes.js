/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: User unique identifier
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *         full_name:
 *           type: string
 *           description: User full name
 *         role:
 *           type: string
 *           enum: [USER, ADMIN]
 *           description: User role
 *         email_verified:
 *           type: boolean
 *           description: Whether email is verified
 *         last_login:
 *           type: string
 *           format: date-time
 *           description: Last login timestamp
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - full_name
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *         password:
 *           type: string
 *           minLength: 8
 *           description: User password (min 8 characters)
 *         full_name:
 *           type: string
 *           minLength: 2
 *           description: User full name
 *     
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *         password:
 *           type: string
 *           description: User password
 *     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Operation success status
 *         message:
 *           type: string
 *           description: Response message
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             access_token:
 *               type: string
 *               description: JWT access token
 *             expires_in:
 *               type: number
 *               description: Token expiration time in seconds
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           description: Error message
 *         code:
 *           type: string
 *           description: Error code
 *         details:
 *           type: object
 *           description: Additional error details
 *     
 *     HealthResponse:
 *       type: object
 *       properties:
 *         service:
 *           type: string
 *           example: auth-service
 *         version:
 *           type: string
 *           example: 1.0.0
 *         status:
 *           type: string
 *           example: healthy
 *         timestamp:
 *           type: string
 *           format: date-time
 *         uptime:
 *           type: number
 *           description: Service uptime in seconds
 *         database:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               example: connected
 *             response_time:
 *               type: number
 *         rabbitmq:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               example: connected
 *         email:
 *           type: object
 *           properties:
 *             configured:
 *               type: boolean
 *             service:
 *               type: string
 *   
 *   parameters:
 *     GatewayUserId:
 *       in: header
 *       name: x-user-id
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 *       description: User ID injected by API Gateway
 *     
 *     GatewayUserRole:
 *       in: header
 *       name: x-user-role
 *       required: true
 *       schema:
 *         type: string
 *         enum: [USER, ADMIN]
 *       description: User role injected by API Gateway
 *   
 *   responses:
 *     Unauthorized:
 *       description: Unauthorized - Invalid or missing authentication
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     
 *     Forbidden:
 *       description: Forbidden - Insufficient permissions
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     
 *     ValidationError:
 *       description: Validation Error - Invalid request data
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     
 *     RateLimitExceeded:
 *       description: Rate Limit Exceeded
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 * 
 * tags:
 *   - name: Authentication
 *     description: User authentication operations
 *   - name: User Management
 *     description: User profile and management operations
 *   - name: Health
 *     description: Service health and monitoring
 */

const express = require('express');
const authController = require('../controllers/authController');
const jwtUtil = require('../utils/jwt');

// Import validation middleware
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateRefreshToken,
  validateEmailVerification,
  validateAccountDeletion,
  validateUserIdParam,
  validateProfileUpdate
} = require('../utils/validation');

// Import security middleware
const {
  validateApiGatewaySecret,
  validateApiGatewayHeaders,
  requireAdmin,
  requireUser
} = require('../middlewares/security');

// Import rate limiting middleware
const {
  authLimiter,
  passwordResetLimiter,
  registrationLimiter,
  refreshLimiter
} = require('../middlewares/rateLimiter');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             email: "user@example.com"
 *             password: "SecurePass123!"
 *             full_name: "John Doe"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Registration successful. Please login to access your account."
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
router.post('/register', validateApiGatewaySecret, registrationLimiter, validateRegister, authController.register);

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify email address using verification token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Email verification JWT token from email link
 *           example:
 *             token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Email verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Email verified successfully. You can now login to your account."
 *                 data:
 *                   type: object
 *                   properties:
 *                     verified:
 *                       type: boolean
 *                       example: true
 *                     alreadyVerified:
 *                       type: boolean
 *                       example: false
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid or expired verification token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/verify-email', validateApiGatewaySecret, validateEmailVerification, authController.verifyEmail);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "user@example.com"
 *             password: "SecurePass123!"
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             description: HTTP-only refresh token cookie
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       423:
 *         description: Account locked due to too many failed attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
router.post('/login', validateApiGatewaySecret, authLimiter, validateLogin, authController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Authentication]
 *     parameters:
 *       - in: cookie
 *         name: refreshToken
 *         required: true
 *         schema:
 *           type: string
 *         description: HTTP-only refresh token cookie
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         headers:
 *           Set-Cookie:
 *             description: New HTTP-only refresh token cookie
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
router.post('/refresh', validateApiGatewaySecret, refreshLimiter, validateRefreshToken, authController.refreshToken);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *           example:
 *             email: "user@example.com"
 *     responses:
 *       200:
 *         description: Password reset email sent (or user not found - same response for security)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "If an account with that email exists, a password reset link has been sent"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
router.post('/forgot-password', validateApiGatewaySecret, passwordResetLimiter, validateForgotPassword, authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using reset token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password reset token from email
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: New password (min 8 characters)
 *           example:
 *             token: "reset-token-from-email"
 *             newPassword: "NewSecurePass123!"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password reset successfully"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid or expired reset token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
router.post('/reset-password', validateApiGatewaySecret, authLimiter, validateResetPassword, authController.resetPassword);

/**
 * @swagger
 * /api/auth/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service health status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
router.get('/health', authController.health); // No auth required for health checks

/**
 * @swagger
 * /api/auth/liveness:
 *   get:
 *     summary: Kubernetes liveness probe
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is alive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: alive
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/liveness', authController.liveness); // No auth required for K8s probes

/**
 * @swagger
 * /api/auth/readiness:
 *   get:
 *     summary: Kubernetes readiness probe
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready to serve traffic
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ready
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 database:
 *                   type: string
 *                   example: connected
 *       503:
 *         description: Service not ready
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/readiness', authController.readiness); // No auth required for K8s probes

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user and invalidate refresh tokens
 *     tags: [Authentication]
 *     parameters:
 *       - $ref: '#/components/parameters/GatewayUserId'
 *       - $ref: '#/components/parameters/GatewayUserRole'
 *     responses:
 *       200:
 *         description: Logout successful
 *         headers:
 *           Set-Cookie:
 *             description: Cleared refresh token cookie
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/logout', validateApiGatewayHeaders, authController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [User Management]
 *     parameters:
 *       - $ref: '#/components/parameters/GatewayUserId'
 *       - $ref: '#/components/parameters/GatewayUserRole'
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/me', validateApiGatewayHeaders, requireUser, authController.getCurrentUser);

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [User Management]
 *     parameters:
 *       - $ref: '#/components/parameters/GatewayUserId'
 *       - $ref: '#/components/parameters/GatewayUserRole'
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *         description: Filter by user role
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Users retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           email:
 *                             type: string
 *                             format: email
 *                           full_name:
 *                             type: string
 *                           role:
 *                             type: string
 *                             enum: [user, admin]
 *                           email_verified:
 *                             type: boolean
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         current_page:
 *                           type: integer
 *                         total_pages:
 *                           type: integer
 *                         total_items:
 *                           type: integer
 *                         items_per_page:
 *                           type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
router.get('/users', validateApiGatewayHeaders, requireAdmin, authLimiter, authController.getAllUsers);

/**
 * @swagger
 * /api/auth/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [User Management]
 *     parameters:
 *       - $ref: '#/components/parameters/GatewayUserId'
 *       - $ref: '#/components/parameters/GatewayUserRole'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
router.get('/users/:id', validateApiGatewayHeaders, requireAdmin, authLimiter, authController.getUserById);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [User Management]
 *     parameters:
 *       - $ref: '#/components/parameters/GatewayUserId'
 *       - $ref: '#/components/parameters/GatewayUserRole'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current user password
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: New password (min 8 characters)
 *           example:
 *             currentPassword: "CurrentPass123!"
 *             newPassword: "NewSecurePass123!"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Current password is incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
router.post('/change-password', 
  validateApiGatewayHeaders, 
  requireUser, 
  authLimiter, 
  validateChangePassword, 
  authController.changePassword
);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User Profile]
 *     parameters:
 *       - $ref: '#/components/parameters/GatewayUserId'
 *       - $ref: '#/components/parameters/GatewayUserRole'
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/profile', validateApiGatewayHeaders, requireUser, authController.getProfile);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [User Profile]
 *     parameters:
 *       - $ref: '#/components/parameters/GatewayUserId'
 *       - $ref: '#/components/parameters/GatewayUserRole'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               phone:
 *                 type: string
 *                 pattern: "^[\\+]?[1-9][\\d]{0,15}$"
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other, prefer_not_to_say]
 *               address:
 *                 type: string
 *                 maxLength: 200
 *               social_links:
 *                 type: object
 *                 properties:
 *                   facebook:
 *                     type: string
 *                   twitter:
 *                     type: string
 *                   instagram:
 *                     type: string
 *                   linkedin:
 *                     type: string
 *                   github:
 *                     type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         description: Phone number already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/profile', validateApiGatewayHeaders, requireUser, validateProfileUpdate, authController.updateProfile);

/**
 * @swagger
 * /api/auth/profile/picture:
 *   put:
 *     summary: Update profile picture
 *     tags: [User Profile]
 *     parameters:
 *       - $ref: '#/components/parameters/GatewayUserId'
 *       - $ref: '#/components/parameters/GatewayUserRole'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profile_picture_url
 *             properties:
 *               profile_picture_url:
 *                 type: string
 *                 format: uri
 *                 description: URL of the new profile picture
 *     responses:
 *       200:
 *         description: Profile picture updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile picture updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile_picture_url:
 *                       type: string
 *                       format: uri
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/profile/picture', validateApiGatewayHeaders, requireUser, authController.updateProfilePicture);

/**
 * @swagger
 * /api/auth/cleanup:
 *   post:
 *     summary: Cleanup expired tokens and sessions (Admin only)
 *     tags: [User Management]
 *     parameters:
 *       - $ref: '#/components/parameters/GatewayUserId'
 *       - $ref: '#/components/parameters/GatewayUserRole'
 *     responses:
 *       200:
 *         description: Cleanup completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cleanup completed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     expired_tokens_removed:
 *                       type: number
 *                       example: 15
 *                     expired_reset_tokens_removed:
 *                       type: number
 *                       example: 8
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/cleanup', validateApiGatewayHeaders, requireAdmin, authController.cleanup);

/**
 * @swagger
 * /api/auth/me:
 *   delete:
 *     summary: Delete own account (self-deletion)
 *     tags: [User Management]
 *     parameters:
 *       - $ref: '#/components/parameters/GatewayUserId'
 *       - $ref: '#/components/parameters/GatewayUserRole'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - confirmText
 *             properties:
 *               password:
 *                 type: string
 *                 description: Current password for verification
 *           example:
 *             password: "CurrentPassword123!"
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Account deleted successfully"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid password or unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Admin accounts cannot be self-deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
router.delete('/me', 
  validateApiGatewayHeaders, 
  requireUser, 
  authLimiter,
  validateAccountDeletion, 
  authController.deleteAccount
);

/**
 * @swagger
 * /api/auth/users/{id}:
 *   delete:
 *     summary: Delete user account (admin only)
 *     tags: [User Management]
 *     parameters:
 *       - $ref: '#/components/parameters/GatewayUserId'
 *       - $ref: '#/components/parameters/GatewayUserRole'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID to delete
 *     responses:
 *       200:
 *         description: User account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User account deleted successfully"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
router.delete('/users/:id', 
  validateApiGatewayHeaders, 
  requireAdmin, 
  authLimiter,
  validateUserIdParam,
  authController.deleteUser
);



// Public key endpoint for Kong API Gateway
router.get('/public-key', (req, res) => {
  try {
    res.json({
      publicKey: jwtUtil.getPublicKey(),
      algorithm: jwtUtil.getAlgorithm(),
      keyId: 'auth-service-key-1'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve public key' });
  }
});

// JWKS endpoint for standards compliance
router.get('/.well-known/jwks.json', (req, res) => {
  try {
    res.json(jwtUtil.getJWKS());
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve JWKS' });
  }
});

/**
 * @swagger
 * /version:
 *   get:
 *     summary: Get service version and deployment info
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Service version information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 service:
 *                   type: string
 *                 version:
 *                   type: string
 *                 deployedAt:
 *                   type: string
 *                 environment:
 *                   type: string
 */
router.get('/version', (req, res) => {
  res.json({
    service: 'auth-service',
    version: '1.0.1',
    deployedAt: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    gitCommit: process.env.GIT_COMMIT || 'local-development',
    buildNumber: process.env.BUILD_NUMBER || Date.now().toString()
  });
});

module.exports = router;