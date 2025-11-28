const Joi = require('joi');

// Define the validation schemas (matching your actual validators)
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  fullName: Joi.string().min(2).max(100).required(),
  phoneNumber: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

describe('Auth Validators', () => {
  describe('Register Validation', () => {
    it('should validate a correct registration payload', () => {
      const validPayload = {
        email: 'test@example.com',
        password: 'Password123!',
        fullName: 'John Doe'
      };

      const { error } = registerSchema.validate(validPayload);
      expect(error).toBeUndefined();
    });

    it('should reject invalid email format', () => {
      const invalidPayload = {
        email: 'invalid-email',
        password: 'Password123!',
        fullName: 'John Doe'
      };

      const { error } = registerSchema.validate(invalidPayload);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('email');
    });

    it('should reject password shorter than 8 characters', () => {
      const invalidPayload = {
        email: 'test@example.com',
        password: 'short',
        fullName: 'John Doe'
      };

      const { error } = registerSchema.validate(invalidPayload);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('password');
    });

    it('should reject empty fullName', () => {
      const invalidPayload = {
        email: 'test@example.com',
        password: 'Password123!',
        fullName: ''
      };

      const { error } = registerSchema.validate(invalidPayload);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('fullName');
    });

    it('should accept optional phoneNumber', () => {
      const validPayload = {
        email: 'test@example.com',
        password: 'Password123!',
        fullName: 'John Doe',
        phoneNumber: '+1-234-567-8900'
      };

      const { error } = registerSchema.validate(validPayload);
      expect(error).toBeUndefined();
    });

    it('should reject invalid phoneNumber format', () => {
      const invalidPayload = {
        email: 'test@example.com',
        password: 'Password123!',
        fullName: 'John Doe',
        phoneNumber: 'not-a-phone'
      };

      const { error } = registerSchema.validate(invalidPayload);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('phoneNumber');
    });
  });

  describe('Login Validation', () => {
    it('should validate correct login credentials', () => {
      const validPayload = {
        email: 'test@example.com',
        password: 'Password123!'
      };

      const { error } = loginSchema.validate(validPayload);
      expect(error).toBeUndefined();
    });

    it('should reject missing email', () => {
      const invalidPayload = {
        password: 'Password123!'
      };

      const { error } = loginSchema.validate(invalidPayload);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('email');
    });

    it('should reject missing password', () => {
      const invalidPayload = {
        email: 'test@example.com'
      };

      const { error } = loginSchema.validate(invalidPayload);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('password');
    });
  });
});
