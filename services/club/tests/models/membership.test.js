import { jest } from '@jest/globals';
import { Membership } from '../../src/config/database';
import ClubModel from '../../src/models/club';

jest.mock('../../src/config/database', () => ({
  Membership: {
    findOne: jest.fn()
  }
}));

describe('Club Model - findMembership', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return membership details if found', async () => {
    const mockMembership = { role: 'MANAGER', joined_at: new Date() };
    Membership.findOne.mockResolvedValue(mockMembership);

    const result = await ClubModel.findMembership('club1', 'user1');
    
    expect(Membership.findOne).toHaveBeenCalledWith({ club_id: 'club1', user_id: 'user1' }, 'role joined_at');
    expect(result).toEqual(mockMembership);
  });

  it('should return null if membership not found', async () => {
    Membership.findOne.mockResolvedValue(null);

    const result = await ClubModel.findMembership('club1', 'user1');

    expect(result).toBeNull();
  });

  it('should throw an error if the database query fails', async () => {
    const dbError = new Error('DB Error');
    Membership.findOne.mockRejectedValue(dbError);

    await expect(ClubModel.findMembership('club1', 'user1')).rejects.toThrow(dbError);
  });
}); 