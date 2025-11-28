const Joi = require('joi');

// Email validation schema
const sendEmailSchema = Joi.object({
  to: Joi.alternatives().try(
    Joi.string().email(),
    Joi.array().items(Joi.string().email()).min(1)
  ).required(),
  subject: Joi.string().min(1).max(500).required(),
  template: Joi.string().valid(
    'verification',
    'password-reset',
    'welcome',
    'event-reminder',
    'club-announcement'
  ).required(),
  data: Joi.object().optional()
});

// Validate email address
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

describe('Notification Validators', () => {
  describe('Send Email Schema Validation', () => {
    it('should validate correct email payload with single recipient', () => {
      const validPayload = {
        to: 'user@example.com',
        subject: 'Welcome to Club Management',
        template: 'welcome',
        data: { userName: 'John' }
      };

      const { error } = sendEmailSchema.validate(validPayload);
      expect(error).toBeUndefined();
    });

    it('should validate correct email payload with multiple recipients', () => {
      const validPayload = {
        to: ['user1@example.com', 'user2@example.com'],
        subject: 'Event Reminder',
        template: 'event-reminder',
        data: { eventName: 'Tech Talk' }
      };

      const { error } = sendEmailSchema.validate(validPayload);
      expect(error).toBeUndefined();
    });

    it('should reject invalid email address', () => {
      const invalidPayload = {
        to: 'invalid-email',
        subject: 'Test',
        template: 'welcome'
      };

      const { error } = sendEmailSchema.validate(invalidPayload);
      expect(error).toBeDefined();
    });

    it('should reject missing subject', () => {
      const invalidPayload = {
        to: 'user@example.com',
        template: 'welcome'
      };

      const { error } = sendEmailSchema.validate(invalidPayload);
      expect(error).toBeDefined();
    });

    it('should reject invalid template', () => {
      const invalidPayload = {
        to: 'user@example.com',
        subject: 'Test',
        template: 'invalid-template'
      };

      const { error } = sendEmailSchema.validate(invalidPayload);
      expect(error).toBeDefined();
    });

    it('should accept all valid templates', () => {
      const templates = [
        'verification',
        'password-reset',
        'welcome',
        'event-reminder',
        'club-announcement'
      ];

      templates.forEach(template => {
        const payload = {
          to: 'user@example.com',
          subject: 'Test Subject',
          template
        };
        const { error } = sendEmailSchema.validate(payload);
        expect(error).toBeUndefined();
      });
    });

    it('should allow optional data field', () => {
      const payload = {
        to: 'user@example.com',
        subject: 'Test',
        template: 'welcome'
        // No data field
      };

      const { error } = sendEmailSchema.validate(payload);
      expect(error).toBeUndefined();
    });

    it('should reject empty recipients array', () => {
      const invalidPayload = {
        to: [],
        subject: 'Test',
        template: 'welcome'
      };

      const { error } = sendEmailSchema.validate(invalidPayload);
      expect(error).toBeDefined();
    });
  });

  describe('Email Address Validation', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user@subdomain.example.com'
      ];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@example.com',
        'user@',
        'user@.com',
        ''
      ];

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });
});
