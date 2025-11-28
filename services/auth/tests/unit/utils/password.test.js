const bcrypt = require('bcryptjs');

// Password utility functions (matching your actual implementation)
const hashPassword = async (password, rounds = 10) => {
  return bcrypt.hash(password, rounds);
};

const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password, 4); // Use low rounds for testing

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password, 4);
      const hash2 = await hashPassword(password, 4);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password, 4);

      const isMatch = await comparePassword(password, hash);
      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword456!';
      const hash = await hashPassword(password, 4);

      const isMatch = await comparePassword(wrongPassword, hash);
      expect(isMatch).toBe(false);
    });

    it('should handle empty password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password, 4);

      const isMatch = await comparePassword('', hash);
      expect(isMatch).toBe(false);
    });
  });
});
