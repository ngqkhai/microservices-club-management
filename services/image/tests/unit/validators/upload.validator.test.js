const Joi = require('joi');

// Image upload validation schema
const uploadSchema = Joi.object({
  folder: Joi.string().valid('profiles', 'clubs', 'events', 'general').default('general'),
  entityId: Joi.string().optional(),
  entityType: Joi.string().valid('user', 'club', 'event').optional()
});

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

// Validate file type
const isValidMimeType = (mimeType) => {
  return ALLOWED_MIME_TYPES.includes(mimeType);
};

// Validate file size (in bytes)
const isValidFileSize = (size, maxSize = 10 * 1024 * 1024) => {
  return size > 0 && size <= maxSize;
};

describe('Image Upload Validators', () => {
  describe('Upload Schema Validation', () => {
    it('should validate correct upload payload', () => {
      const validPayload = {
        folder: 'profiles',
        entityId: 'user-123',
        entityType: 'user'
      };

      const { error } = uploadSchema.validate(validPayload);
      expect(error).toBeUndefined();
    });

    it('should use default folder when not specified', () => {
      const payload = {};
      const { error, value } = uploadSchema.validate(payload);

      expect(error).toBeUndefined();
      expect(value.folder).toBe('general');
    });

    it('should reject invalid folder', () => {
      const invalidPayload = {
        folder: 'invalid-folder'
      };

      const { error } = uploadSchema.validate(invalidPayload);
      expect(error).toBeDefined();
    });

    it('should accept all valid folders', () => {
      const folders = ['profiles', 'clubs', 'events', 'general'];

      folders.forEach(folder => {
        const { error } = uploadSchema.validate({ folder });
        expect(error).toBeUndefined();
      });
    });

    it('should reject invalid entityType', () => {
      const invalidPayload = {
        entityType: 'invalid-type'
      };

      const { error } = uploadSchema.validate(invalidPayload);
      expect(error).toBeDefined();
    });
  });

  describe('MIME Type Validation', () => {
    it('should accept JPEG images', () => {
      expect(isValidMimeType('image/jpeg')).toBe(true);
    });

    it('should accept PNG images', () => {
      expect(isValidMimeType('image/png')).toBe(true);
    });

    it('should accept GIF images', () => {
      expect(isValidMimeType('image/gif')).toBe(true);
    });

    it('should accept WebP images', () => {
      expect(isValidMimeType('image/webp')).toBe(true);
    });

    it('should reject PDF files', () => {
      expect(isValidMimeType('application/pdf')).toBe(false);
    });

    it('should reject text files', () => {
      expect(isValidMimeType('text/plain')).toBe(false);
    });

    it('should reject video files', () => {
      expect(isValidMimeType('video/mp4')).toBe(false);
    });
  });

  describe('File Size Validation', () => {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB

    it('should accept file under max size', () => {
      expect(isValidFileSize(5 * 1024 * 1024, MAX_SIZE)).toBe(true);
    });

    it('should accept file at exactly max size', () => {
      expect(isValidFileSize(MAX_SIZE, MAX_SIZE)).toBe(true);
    });

    it('should reject file over max size', () => {
      expect(isValidFileSize(15 * 1024 * 1024, MAX_SIZE)).toBe(false);
    });

    it('should reject zero-byte file', () => {
      expect(isValidFileSize(0, MAX_SIZE)).toBe(false);
    });

    it('should reject negative file size', () => {
      expect(isValidFileSize(-100, MAX_SIZE)).toBe(false);
    });
  });
});
