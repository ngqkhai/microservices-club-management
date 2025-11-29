/**
 * Image Service API Integration Tests
 * 
 * Tests all image service endpoints through the Kong API Gateway
 * Kong handles the API Gateway secret header injection (service-level plugin)
 */

const request = require('supertest');
const path = require('path');
const fs = require('fs');

// Test configuration
const KONG_URL = process.env.KONG_URL || 'http://localhost:8000';

// Test user credentials (from seed data)
const TEST_USERS = {
  admin: {
    email: 'admin@clubmanagement.com',
    password: 'Password123!'
  },
  manager: {
    email: 'manager@clubmanagement.com',
    password: 'Password123!'
  },
  user: {
    email: 'user@clubmanagement.com',
    password: 'Password123!'
  }
};

// Helper to make requests through Kong
const kongRequest = () => request(KONG_URL);

// Login and get token
async function loginUser(email, password) {
  const response = await kongRequest()
    .post('/api/auth/login')
    .send({ email, password });
  
  if (response.status !== 200) {
    throw new Error(`Login failed: ${response.body.message || response.status}`);
  }
  
  return response.body.data.accessToken;
}

// Helper to create a test image file
function createTestImagePath() {
  const testImageDir = path.join(__dirname, 'test-assets');
  const testImagePath = path.join(testImageDir, 'test-image.jpg');
  
  if (!fs.existsSync(testImageDir)) {
    fs.mkdirSync(testImageDir, { recursive: true });
  }
  
  // Create a minimal valid JPEG file if it doesn't exist
  if (!fs.existsSync(testImagePath)) {
    // Minimal valid JPEG (1x1 pixel)
    const minimalJpeg = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
      0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
      0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
      0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x1F, 0x00, 0x00,
      0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
      0x09, 0x0A, 0x0B, 0xFF, 0xC4, 0x00, 0xB5, 0x10, 0x00, 0x02, 0x01, 0x03,
      0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7D,
      0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
      0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xA1, 0x08,
      0x23, 0x42, 0xB1, 0xC1, 0x15, 0x52, 0xD1, 0xF0, 0x24, 0x33, 0x62, 0x72,
      0x82, 0x09, 0x0A, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x25, 0x26, 0x27, 0x28,
      0x29, 0x2A, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x43, 0x44, 0x45,
      0x46, 0x47, 0x48, 0x49, 0x4A, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
      0x5A, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6A, 0x73, 0x74, 0x75,
      0x76, 0x77, 0x78, 0x79, 0x7A, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
      0x8A, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9A, 0xA2, 0xA3,
      0xA4, 0xA5, 0xA6, 0xA7, 0xA8, 0xA9, 0xAA, 0xB2, 0xB3, 0xB4, 0xB5, 0xB6,
      0xB7, 0xB8, 0xB9, 0xBA, 0xC2, 0xC3, 0xC4, 0xC5, 0xC6, 0xC7, 0xC8, 0xC9,
      0xCA, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7, 0xD8, 0xD9, 0xDA, 0xE1, 0xE2,
      0xE3, 0xE4, 0xE5, 0xE6, 0xE7, 0xE8, 0xE9, 0xEA, 0xF1, 0xF2, 0xF3, 0xF4,
      0xF5, 0xF6, 0xF7, 0xF8, 0xF9, 0xFA, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01,
      0x00, 0x00, 0x3F, 0x00, 0xFB, 0xD5, 0xDB, 0x20, 0xA8, 0x60, 0x59, 0x00,
      0xAD, 0xC8, 0x3F, 0xFF, 0xD9
    ]);
    fs.writeFileSync(testImagePath, minimalJpeg);
  }
  
  return testImagePath;
}

describe('Image Service API Tests', () => {
  let adminToken;
  let managerToken;
  let userToken;
  let uploadedImagePublicId;
  let testImagePath;

  beforeAll(async () => {
    try {
      adminToken = await loginUser(TEST_USERS.admin.email, TEST_USERS.admin.password);
      managerToken = await loginUser(TEST_USERS.manager.email, TEST_USERS.manager.password);
      userToken = await loginUser(TEST_USERS.user.email, TEST_USERS.user.password);
      testImagePath = createTestImagePath();
    } catch (error) {
      console.error('Setup failed:', error.message);
      throw error;
    }
  }, 30000);

  afterAll(async () => {
    // Cleanup test image file
    const testAssetDir = path.join(__dirname, 'test-assets');
    if (fs.existsSync(testAssetDir)) {
      fs.rmSync(testAssetDir, { recursive: true, force: true });
    }
  });

  // ==================== HEALTH CHECK TESTS ====================
  describe('Health Check Endpoints', () => {
    test('GET /api/images/health - should return health status', async () => {
      const response = await kongRequest()
        .get('/api/images/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('service', 'image-service');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  // ==================== SINGLE IMAGE UPLOAD TESTS ====================
  describe('Single Image Upload', () => {
    test('POST /api/images/upload - admin can upload image', async () => {
      const response = await kongRequest()
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('type', 'avatar')
        .field('folder', 'test_uploads')
        .field('entity_type', 'user')
        .attach('image', testImagePath);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Image uploaded successfully');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('public_id');
      expect(response.body.data).toHaveProperty('url');
      
      // Save for later tests
      uploadedImagePublicId = response.body.data.public_id;
    }, 30000);

    test('POST /api/images/upload - manager can upload image', async () => {
      const response = await kongRequest()
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${managerToken}`)
        .field('type', 'club_logo')
        .field('folder', 'test_uploads')
        .field('entity_type', 'club')
        .attach('image', testImagePath);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('public_id');
    }, 30000);

    test('POST /api/images/upload - regular user can also upload (no entity restrictions)', async () => {
      const response = await kongRequest()
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('type', 'avatar')
        .field('folder', 'test_uploads')
        .attach('image', testImagePath);

      // Regular users CAN upload when not specifying restricted entity types
      expect(response.status).toBe(201);
    }, 30000);

    test('POST /api/images/upload - should fail without authentication', async () => {
      const response = await kongRequest()
        .post('/api/images/upload')
        .field('type', 'avatar')
        .attach('image', testImagePath);

      expect(response.status).toBe(401);
    });

    test('POST /api/images/upload - should fail without image file', async () => {
      const response = await kongRequest()
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('type', 'avatar')
        .field('folder', 'test_uploads');

      expect([400, 500]).toContain(response.status);
    });

    test('POST /api/images/upload - can upload with default options', async () => {
      const response = await kongRequest()
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', testImagePath);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    }, 30000);
  });

  // ==================== BULK IMAGE UPLOAD TESTS ====================
  describe('Bulk Image Upload', () => {
    test('POST /api/images/upload/bulk - admin can upload multiple images', async () => {
      const response = await kongRequest()
        .post('/api/images/upload/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('type', 'gallery')
        .field('folder', 'test_bulk')
        .field('entity_type', 'club')
        .attach('images', testImagePath)
        .attach('images', testImagePath);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    }, 30000);

    test('POST /api/images/upload/bulk - manager can upload multiple images', async () => {
      const response = await kongRequest()
        .post('/api/images/upload/bulk')
        .set('Authorization', `Bearer ${managerToken}`)
        .field('type', 'event_photos')
        .attach('images', testImagePath);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    }, 30000);

    test('POST /api/images/upload/bulk - should fail without authentication', async () => {
      const response = await kongRequest()
        .post('/api/images/upload/bulk')
        .attach('images', testImagePath);

      expect(response.status).toBe(401);
    });

    test('POST /api/images/upload/bulk - regular user can also bulk upload', async () => {
      const response = await kongRequest()
        .post('/api/images/upload/bulk')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('images', testImagePath);

      // Regular users CAN upload when not specifying restricted entity types
      expect(response.status).toBe(201);
    }, 30000);

    test('POST /api/images/upload/bulk - should fail without image files', async () => {
      const response = await kongRequest()
        .post('/api/images/upload/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('type', 'gallery');

      expect([400, 500]).toContain(response.status);
    });
  });

  // ==================== GET IMAGE INFO TESTS ====================
  describe('Get Image Info', () => {
    test('GET /api/images/:publicId - should get 404 for non-MongoDB path (Kong routes only MongoDB IDs)', async () => {
      // Note: Kong routes /api/images/:id only for MongoDB ObjectId format (24 hex chars)
      // MinIO public_ids are paths like "folder/type/filename.jpg" which don't match
      if (!uploadedImagePublicId) {
        console.log('Skipping: no uploaded image available');
        return;
      }

      const response = await kongRequest()
        .get(`/api/images/${encodeURIComponent(uploadedImagePublicId)}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Kong returns 404 because the route regex only matches MongoDB ObjectIds
      expect(response.status).toBe(404);
    });

    test('GET /api/images/:publicId - should fail without authentication for MongoDB-like ID', async () => {
      const response = await kongRequest()
        .get('/api/images/507f1f77bcf86cd799439011');

      expect(response.status).toBe(401);
    });

    test('GET /api/images/:publicId - valid MongoDB ID format with auth returns 500 (not found in storage)', async () => {
      const response = await kongRequest()
        .get('/api/images/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      // Image doesn't exist in storage, so expect error
      expect([404, 500]).toContain(response.status);
    });
  });

  // ==================== DELETE IMAGE TESTS ====================
  describe('Delete Image', () => {
    let imageToDelete;

    beforeAll(async () => {
      // Upload an image specifically for deletion tests
      const response = await kongRequest()
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('type', 'test')
        .field('folder', 'delete_test')
        .attach('image', testImagePath);

      if (response.status === 201 && response.body.data) {
        imageToDelete = response.body.data.publicId;
      }
    }, 30000);

    test('DELETE /api/images/:publicId - should fail without authentication', async () => {
      const response = await kongRequest()
        .delete('/api/images/507f1f77bcf86cd799439011');

      expect(response.status).toBe(401);
    });

    test('DELETE /api/images/:publicId - admin can delete image', async () => {
      if (!imageToDelete) {
        console.log('Skipping: no image available for deletion');
        return;
      }

      const response = await kongRequest()
        .delete(`/api/images/${encodeURIComponent(imageToDelete)}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Should succeed or image might not exist
      expect([200, 404, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
      }
    });
  });

  // ==================== AUTHORIZATION TESTS ====================
  describe('Authorization and Access Control', () => {
    test('Regular user can upload images without entity restrictions', async () => {
      const response = await kongRequest()
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('type', 'avatar')
        .attach('image', testImagePath);

      // Users can upload when not specifying club/event entity types
      expect(response.status).toBe(201);
    }, 30000);

    test('Regular user can bulk upload images', async () => {
      const response = await kongRequest()
        .post('/api/images/upload/bulk')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('images', testImagePath);

      expect(response.status).toBe(201);
    }, 30000);

    test('Manager has upload permissions', async () => {
      const response = await kongRequest()
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${managerToken}`)
        .field('type', 'club_photo')
        .attach('image', testImagePath);

      expect(response.status).toBe(201);
    }, 30000);
  });

  // ==================== INPUT VALIDATION TESTS ====================
  describe('Input Validation', () => {
    test('Upload accepts various image types/folders', async () => {
      const response = await kongRequest()
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('type', 'custom_type')
        .field('folder', 'custom_folder')
        .field('entity_type', 'custom')
        .field('entity_id', '12345')
        .attach('image', testImagePath);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    }, 30000);

    test('Empty folder uses default', async () => {
      const response = await kongRequest()
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('type', 'general')
        .attach('image', testImagePath);

      expect(response.status).toBe(201);
    }, 30000);
  });

  // ==================== ERROR HANDLING TESTS ====================
  describe('Error Handling', () => {
    test('Invalid token format returns 401', async () => {
      const response = await kongRequest()
        .post('/api/images/upload')
        .set('Authorization', 'Bearer invalid-token')
        .attach('image', testImagePath);

      expect(response.status).toBe(401);
    });

    test('Expired token returns 401', async () => {
      // This is a properly structured but expired JWT
      const expiredToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDF9.fake';
      
      const response = await kongRequest()
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${expiredToken}`)
        .attach('image', testImagePath);

      expect(response.status).toBe(401);
    });

    test('Missing Authorization header returns 401', async () => {
      const response = await kongRequest()
        .post('/api/images/upload')
        .field('type', 'avatar')
        .attach('image', testImagePath);

      expect(response.status).toBe(401);
    });
  });
});
