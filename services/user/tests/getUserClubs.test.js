const request = require('supertest');
const jwt = require('jsonwebtoken');
const nock = require('nock');
const app = require('../src/index');
const { sequelize } = require('../src/config/database');
const User = require('../src/models/user');

const CLUB_SERVICE_URL = process.env.CLUB_SERVICE_URL || 'http://localhost:3001';

const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
};
const mockToken = jwt.sign(mockUser, process.env.JWT_SECRET, { expiresIn: '1h' });

beforeAll(async () => {
  await sequelize.authenticate();
});

beforeEach(async () => {
  await User.destroy({ where: {}, truncate: true });

  await User.create({
    id: mockUser.id,
    full_name: 'Nguyen Van A',
    phone: '0908888888',
    email: mockUser.email,
    avatar_url: null,
    created_at: new Date(),
    updated_at: new Date(),
  });

  nock(CLUB_SERVICE_URL)
    .get(`/api/clubs/user/${mockUser.id}`)
    .matchHeader('Authorization', `Bearer ${mockToken}`)
    .reply(200, [
      {
        club_id: 'c001',
        name: 'CLB Âm Nhạc',
        role_in_club: 'member',
        join_date: '2024-10-01',
      },
    ]);
});

afterEach(() => {
  nock.cleanAll();
});

afterAll(async () => {
  if (!process.env.JEST_WORKER_ID || process.env.JEST_WORKER_ID === '1') {
    await sequelize.close();
  }
});

describe('GET /api/users/me/clubs', () => {
  it('should retrieve user clubs successfully', async () => {
    const response = await request(app)
      .get('/api/users/me/clubs')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        club_id: 'c001',
        name: 'CLB Âm Nhạc',
        role_in_club: 'member',
        join_date: '2024-10-01',
      },
    ]);
  });

  it('should fail with invalid token', async () => {
    const response = await request(app)
      .get('/api/users/me/clubs')
      .set('Authorization', 'Bearer invalid_token');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Token không hợp lệ' });
  });

  it('should return empty array if user has no clubs', async () => {
    const newUserId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    const newToken = jwt.sign(
      { id: newUserId, email: 'test2@example.com' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    await User.create({
      id: newUserId,
      full_name: 'Nguyen Van C',
      phone: '0912345678',
      email: 'test2@example.com',
      created_at: new Date(),
      updated_at: new Date(),
    });

    nock(CLUB_SERVICE_URL)
      .get(`/api/clubs/user/${newUserId}`)
      .matchHeader('Authorization', `Bearer ${newToken}`)
      .reply(200, []);

    const response = await request(app)
      .get('/api/users/me/clubs')
      .set('Authorization', `Bearer ${newToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});
