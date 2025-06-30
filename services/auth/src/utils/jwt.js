const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
const config = require('../config');

class JWTUtil {
  constructor() {
    const jwtConfig = config.getJWTConfig();
    this.accessTokenSecret = jwtConfig.accessTokenSecret;
    this.accessTokenExpiry = jwtConfig.accessTokenExpiry;
    this.refreshTokenSecret = jwtConfig.refreshTokenSecret;
    this.refreshTokenExpiry = jwtConfig.refreshTokenExpiry;

    if (!this.accessTokenSecret || !this.refreshTokenSecret) {
      throw new Error('JWT secrets must be defined in environment variables');
    }
  }

  generateAccessToken(payload) {
    try {
      const tokenPayload = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        type: 'access'
      };

      return jwt.sign(tokenPayload, this.accessTokenSecret, {
        expiresIn: this.accessTokenExpiry,
        issuer: 'auth-service',
        audience: 'club-management-system'
      });
    } catch (error) {
      logger.error('Error generating access token:', error);
      throw new Error('Failed to generate access token');
    }
  }

  generateRefreshToken(payload) {
    try {
      const tokenPayload = {
        id: payload.id,
        email: payload.email,
        type: 'refresh'
      };

      return jwt.sign(tokenPayload, this.refreshTokenSecret, {
        expiresIn: this.refreshTokenExpiry,
        issuer: 'auth-service',
        audience: 'club-management-system'
      });
    } catch (error) {
      logger.error('Error generating refresh token:', error);
      throw new Error('Failed to generate refresh token');
    }
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.accessTokenSecret, {
        issuer: 'auth-service',
        audience: 'club-management-system'
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Access token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid access token');
      } else {
        logger.error('Error verifying access token:', error);
        throw new Error('Failed to verify access token');
      }
    }
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'auth-service',
        audience: 'club-management-system'
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid refresh token');
      } else {
        logger.error('Error verifying refresh token:', error);
        throw new Error('Failed to verify refresh token');
      }
    }
  }

  decodeToken(token) {
    try {
      return jwt.decode(token, { complete: true });
    } catch (error) {
      logger.error('Error decoding token:', error);
      return null;
    }
  }

  getTokenExpirationTime(token) {
    try {
      const decoded = this.decodeToken(token);
      if (decoded && decoded.payload && decoded.payload.exp) {
        return new Date(decoded.payload.exp * 1000);
      }
      return null;
    } catch (error) {
      logger.error('Error getting token expiration:', error);
      return null;
    }
  }

  isTokenExpired(token) {
    try {
      const expirationTime = this.getTokenExpirationTime(token);
      if (!expirationTime) return true;
      
      return new Date() > expirationTime;
    } catch (error) {
      return true;
    }
  }

  generateEmailVerificationToken(userId, email) {
    try {
      const tokenPayload = {
        userId,
        email,
        type: 'email_verification'
      };

      return jwt.sign(tokenPayload, this.accessTokenSecret, {
        expiresIn: '1h', // 1 hour expiration for email verification
        issuer: 'auth-service',
        audience: 'club-management-system'
      });
    } catch (error) {
      logger.error('Error generating email verification token:', error);
      throw new Error('Failed to generate email verification token');
    }
  }

  verifyEmailVerificationToken(token) {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: 'auth-service',
        audience: 'club-management-system'
      });

      // Ensure this is an email verification token
      if (decoded.type !== 'email_verification') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Email verification token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid email verification token');
      } else {
        logger.error('Error verifying email verification token:', error);
        throw new Error('Failed to verify email verification token');
      }
    }
  }

  generateTokenPair(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload)
    };
  }
}

module.exports = new JWTUtil(); 