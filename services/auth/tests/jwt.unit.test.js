const jwtUtil = require('../src/utils/jwt');

describe('JWT Utility Functions', () => {
  const testUser = {
    id: '12345678-1234-1234-1234-123456789012',
    email: 'test@example.com',
    role: 'USER',
    full_name: 'Test User'
  };

  describe('generateTokenPair', () => {
    test('should generate valid access and refresh tokens', () => {
      const tokens = jwtUtil.generateTokenPair(testUser);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
      expect(tokens.accessToken.split('.')).toHaveLength(3); // JWT format
      expect(tokens.refreshToken.split('.')).toHaveLength(3); // JWT format
    });

    test('should generate different tokens each time', async () => {
      const tokens1 = jwtUtil.generateTokenPair(testUser);
      
      // Wait 1 second to ensure different iat timestamp
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const tokens2 = jwtUtil.generateTokenPair(testUser);

      expect(tokens1.accessToken).not.toBe(tokens2.accessToken);
      expect(tokens1.refreshToken).not.toBe(tokens2.refreshToken);
    });
  });

  describe('verifyAccessToken', () => {
    test('should verify valid access token', () => {
      const { accessToken } = jwtUtil.generateTokenPair(testUser);
      const decoded = jwtUtil.verifyAccessToken(accessToken);

      expect(decoded.id).toBe(testUser.id);
      expect(decoded.email).toBe(testUser.email);
      expect(decoded.role).toBe(testUser.role);
      expect(decoded.full_name).toBe(testUser.full_name);
      expect(decoded.type).toBe('access');
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    test('should reject invalid token', () => {
      expect(() => jwtUtil.verifyAccessToken('invalid-token'))
        .toThrow('Invalid access token');
    });

    test('should reject malformed token', () => {
      expect(() => jwtUtil.verifyAccessToken('not.a.jwt'))
        .toThrow('Invalid access token');
    });
  });

  describe('verifyRefreshToken', () => {
    test('should verify valid refresh token', () => {
      const { refreshToken } = jwtUtil.generateTokenPair(testUser);
      const decoded = jwtUtil.verifyRefreshToken(refreshToken);

      expect(decoded.id).toBe(testUser.id);
      expect(decoded.email).toBe(testUser.email);
      expect(decoded.type).toBe('refresh');
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    test('should reject invalid refresh token', () => {
      expect(() => jwtUtil.verifyRefreshToken('invalid-token'))
        .toThrow('Invalid refresh token');
    });

    test('should reject access token as refresh token', () => {
      const { accessToken } = jwtUtil.generateTokenPair(testUser);
      
      // Access token should fail refresh token validation
      expect(() => jwtUtil.verifyRefreshToken(accessToken))
        .toThrow('Invalid refresh token');
    });
  });

  describe('generateEmailVerificationToken', () => {
    test('should generate valid email verification token', () => {
      const token = jwtUtil.generateEmailVerificationToken(testUser.id, testUser.email);
      
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    test('should generate different tokens for same email', async () => {
      const token1 = jwtUtil.generateEmailVerificationToken(testUser.id, testUser.email);
      
      // Wait 1 second to ensure different iat timestamp
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const token2 = jwtUtil.generateEmailVerificationToken(testUser.id, testUser.email);
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyEmailVerificationToken', () => {
    test('should verify valid email verification token', () => {
      const token = jwtUtil.generateEmailVerificationToken(testUser.id, testUser.email);
      const decoded = jwtUtil.verifyEmailVerificationToken(token);

      expect(decoded.userId).toBe(testUser.id);
      expect(decoded.email).toBe(testUser.email);
      expect(decoded.type).toBe('email_verification');
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    test('should reject invalid email verification token', () => {
      expect(() => jwtUtil.verifyEmailVerificationToken('invalid-token'))
        .toThrow('Invalid email verification token');
    });

    test('should reject other token types as email verification token', () => {
      const { accessToken } = jwtUtil.generateTokenPair(testUser);
      
      expect(() => jwtUtil.verifyEmailVerificationToken(accessToken))
        .toThrow('Failed to verify email verification token');
    });
  });

  describe('Token expiry validation', () => {
    test('access token should have shorter expiry than refresh token', () => {
      const { accessToken, refreshToken } = jwtUtil.generateTokenPair(testUser);
      
      const accessDecoded = jwtUtil.verifyAccessToken(accessToken);
      const refreshDecoded = jwtUtil.verifyRefreshToken(refreshToken);
      
      expect(accessDecoded.exp).toBeLessThan(refreshDecoded.exp);
    });

    test('tokens should have reasonable expiry times', () => {
      const { accessToken, refreshToken } = jwtUtil.generateTokenPair(testUser);
      
      const accessDecoded = jwtUtil.verifyAccessToken(accessToken);
      const refreshDecoded = jwtUtil.verifyRefreshToken(refreshToken);
      
      const now = Math.floor(Date.now() / 1000);
      
      // Access token should expire within reasonable time (less than 24 hours)
      expect(accessDecoded.exp - now).toBeLessThan(24 * 60 * 60);
      
      // Refresh token should expire later (more than access token)
      expect(refreshDecoded.exp - now).toBeGreaterThan(accessDecoded.exp - now);
    });
  });

  describe('Utility functions', () => {
    test('should decode token without verification', () => {
      const { accessToken } = jwtUtil.generateTokenPair(testUser);
      const decoded = jwtUtil.decodeToken(accessToken);
      
      expect(decoded).toBeDefined();
      expect(decoded.payload.id).toBe(testUser.id);
      expect(decoded.payload.email).toBe(testUser.email);
    });

    test('should check if token is expired', () => {
      const { accessToken } = jwtUtil.generateTokenPair(testUser);
      const isExpired = jwtUtil.isTokenExpired(accessToken);
      
      expect(isExpired).toBe(false); // Should not be expired immediately
    });

    test('should get public key', () => {
      const publicKey = jwtUtil.getPublicKey();
      expect(typeof publicKey).toBe('string');
      expect(publicKey).toContain('BEGIN PUBLIC KEY');
    });

    test('should get algorithm', () => {
      const algorithm = jwtUtil.getAlgorithm();
      expect(algorithm).toBe('RS256');
    });
  });
});
