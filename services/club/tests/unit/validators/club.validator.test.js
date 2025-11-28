const Joi = require('joi');

// Club validation schema
const createClubSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(1000).optional(),
  category: Joi.string().valid('academic', 'sports', 'arts', 'technology', 'social', 'other').optional(),
  isPublic: Joi.boolean().default(true)
});

const updateClubSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(1000).optional(),
  category: Joi.string().valid('academic', 'sports', 'arts', 'technology', 'social', 'other').optional(),
  isPublic: Joi.boolean().optional()
}).min(1);

describe('Club Validators', () => {
  describe('Create Club Validation', () => {
    it('should validate a correct club creation payload', () => {
      const validPayload = {
        name: 'Photography Club',
        description: 'A club for photography enthusiasts',
        category: 'arts',
        isPublic: true
      };

      const { error } = createClubSchema.validate(validPayload);
      expect(error).toBeUndefined();
    });

    it('should validate minimal club payload (only name)', () => {
      const validPayload = {
        name: 'Chess Club'
      };

      const { error } = createClubSchema.validate(validPayload);
      expect(error).toBeUndefined();
    });

    it('should reject empty name', () => {
      const invalidPayload = {
        name: ''
      };

      const { error } = createClubSchema.validate(invalidPayload);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('name');
    });

    it('should reject name shorter than 2 characters', () => {
      const invalidPayload = {
        name: 'A'
      };

      const { error } = createClubSchema.validate(invalidPayload);
      expect(error).toBeDefined();
    });

    it('should reject invalid category', () => {
      const invalidPayload = {
        name: 'Test Club',
        category: 'invalid-category'
      };

      const { error } = createClubSchema.validate(invalidPayload);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('category');
    });

    it('should accept all valid categories', () => {
      const categories = ['academic', 'sports', 'arts', 'technology', 'social', 'other'];

      categories.forEach(category => {
        const payload = { name: 'Test Club', category };
        const { error } = createClubSchema.validate(payload);
        expect(error).toBeUndefined();
      });
    });
  });

  describe('Update Club Validation', () => {
    it('should validate a valid update payload', () => {
      const validPayload = {
        name: 'Updated Club Name',
        description: 'New description'
      };

      const { error } = updateClubSchema.validate(validPayload);
      expect(error).toBeUndefined();
    });

    it('should reject empty update payload', () => {
      const invalidPayload = {};

      const { error } = updateClubSchema.validate(invalidPayload);
      expect(error).toBeDefined();
    });

    it('should allow updating single field', () => {
      const validPayload = {
        isPublic: false
      };

      const { error } = updateClubSchema.validate(validPayload);
      expect(error).toBeUndefined();
    });
  });
});
