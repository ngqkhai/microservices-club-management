import Joi from 'joi';

// Event validation schema
const createEventSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(5000).optional(),
  clubId: Joi.string().required(),
  eventType: Joi.string().valid('in-person', 'online', 'hybrid').default('in-person'),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  location: Joi.string().max(500).optional(),
  maxAttendees: Joi.number().integer().min(1).optional(),
  isPublic: Joi.boolean().default(true)
});

const updateEventSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().max(5000).optional(),
  eventType: Joi.string().valid('in-person', 'online', 'hybrid').optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  location: Joi.string().max(500).optional(),
  maxAttendees: Joi.number().integer().min(1).optional(),
  isPublic: Joi.boolean().optional()
}).min(1);

describe('Event Validators', () => {
  describe('Create Event Validation', () => {
    it('should validate a correct event creation payload', () => {
      const validPayload = {
        title: 'Annual Tech Conference',
        description: 'Join us for an amazing tech conference',
        clubId: '507f1f77bcf86cd799439011',
        eventType: 'hybrid',
        startDate: '2025-12-01T10:00:00Z',
        endDate: '2025-12-01T18:00:00Z',
        location: 'Main Auditorium',
        maxAttendees: 100,
        isPublic: true
      };

      const { error } = createEventSchema.validate(validPayload);
      expect(error).toBeUndefined();
    });

    it('should validate minimal event payload', () => {
      const validPayload = {
        title: 'Quick Meeting',
        clubId: '507f1f77bcf86cd799439011',
        startDate: '2025-12-01T10:00:00Z',
        endDate: '2025-12-01T11:00:00Z'
      };

      const { error } = createEventSchema.validate(validPayload);
      expect(error).toBeUndefined();
    });

    it('should reject missing title', () => {
      const invalidPayload = {
        clubId: '507f1f77bcf86cd799439011',
        startDate: '2025-12-01T10:00:00Z',
        endDate: '2025-12-01T11:00:00Z'
      };

      const { error } = createEventSchema.validate(invalidPayload);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('title');
    });

    it('should reject title shorter than 3 characters', () => {
      const invalidPayload = {
        title: 'AB',
        clubId: '507f1f77bcf86cd799439011',
        startDate: '2025-12-01T10:00:00Z',
        endDate: '2025-12-01T11:00:00Z'
      };

      const { error } = createEventSchema.validate(invalidPayload);
      expect(error).toBeDefined();
    });

    it('should reject endDate before startDate', () => {
      const invalidPayload = {
        title: 'Test Event',
        clubId: '507f1f77bcf86cd799439011',
        startDate: '2025-12-01T18:00:00Z',
        endDate: '2025-12-01T10:00:00Z' // Before start
      };

      const { error } = createEventSchema.validate(invalidPayload);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('endDate');
    });

    it('should reject invalid eventType', () => {
      const invalidPayload = {
        title: 'Test Event',
        clubId: '507f1f77bcf86cd799439011',
        eventType: 'invalid-type',
        startDate: '2025-12-01T10:00:00Z',
        endDate: '2025-12-01T11:00:00Z'
      };

      const { error } = createEventSchema.validate(invalidPayload);
      expect(error).toBeDefined();
    });

    it('should accept all valid event types', () => {
      const eventTypes = ['in-person', 'online', 'hybrid'];

      eventTypes.forEach(eventType => {
        const payload = {
          title: 'Test Event',
          clubId: '507f1f77bcf86cd799439011',
          eventType,
          startDate: '2025-12-01T10:00:00Z',
          endDate: '2025-12-01T11:00:00Z'
        };
        const { error } = createEventSchema.validate(payload);
        expect(error).toBeUndefined();
      });
    });

    it('should reject negative maxAttendees', () => {
      const invalidPayload = {
        title: 'Test Event',
        clubId: '507f1f77bcf86cd799439011',
        startDate: '2025-12-01T10:00:00Z',
        endDate: '2025-12-01T11:00:00Z',
        maxAttendees: -5
      };

      const { error } = createEventSchema.validate(invalidPayload);
      expect(error).toBeDefined();
    });
  });

  describe('Update Event Validation', () => {
    it('should validate a valid update payload', () => {
      const validPayload = {
        title: 'Updated Event Title',
        location: 'New Location'
      };

      const { error } = updateEventSchema.validate(validPayload);
      expect(error).toBeUndefined();
    });

    it('should reject empty update payload', () => {
      const invalidPayload = {};

      const { error } = updateEventSchema.validate(invalidPayload);
      expect(error).toBeDefined();
    });

    it('should allow updating single field', () => {
      const validPayload = {
        isPublic: false
      };

      const { error } = updateEventSchema.validate(validPayload);
      expect(error).toBeUndefined();
    });
  });
});
