const mongoose = require('mongoose');
const { Club } = require('../../src/config/database');
const ClubModel = require('../../src/models/club');

describe('Club Model', () => {
  // Test data
  const testClubData = {
    name: 'Test Club',
    description: 'Club for testing',
    type: 'ACADEMIC',
    logo_url: 'http://example.com/logo.png',
    created_by: new mongoose.Types.ObjectId()
  };

  // Test for findAll method
  describe('findAll', () => {
    beforeEach(async () => {
      // Create some test clubs
      await Promise.all([
        new Club({
          name: 'Academic Club',
          description: 'For academic activities',
          type: 'ACADEMIC',
          status: 'ACTIVE',
          created_by: new mongoose.Types.ObjectId()
        }).save(),
        new Club({
          name: 'Sports Club',
          description: 'For sports activities',
          type: 'SPORTS',
          status: 'ACTIVE',
          created_by: new mongoose.Types.ObjectId()
        }).save(),
        new Club({
          name: 'Inactive Club',
          description: 'Inactive club',
          type: 'CULTURAL',
          status: 'INACTIVE',
          created_by: new mongoose.Types.ObjectId()
        }).save()
      ]);
    });

    test('should return all clubs when no filters are applied', async () => {
      const result = await ClubModel.findAll({});
      expect(result.total).toBe(3);
      expect(result.results.length).toBe(3);
    });

    test('should filter clubs by name', async () => {
      const result = await ClubModel.findAll({ name: 'academic' });
      expect(result.total).toBe(1);
      expect(result.results[0].name).toBe('Academic Club');
    });

    test('should filter clubs by type', async () => {
      const result = await ClubModel.findAll({ type: 'SPORTS' });
      expect(result.total).toBe(1);
      expect(result.results[0].type).toBe('SPORTS');
    });

    test('should filter clubs by status', async () => {
      const result = await ClubModel.findAll({ status: 'INACTIVE' });
      expect(result.total).toBe(1);
      expect(result.results[0].status).toBe('INACTIVE');
    });

    test('should implement pagination correctly', async () => {
      const result = await ClubModel.findAll({ page: 1, limit: 2 });
      expect(result.total).toBe(3); // Total count should still be 3
      expect(result.results.length).toBe(2); // But only 2 results per page
    });
  });

  // Test for findById method
  describe('findById', () => {
    let savedClub;

    beforeEach(async () => {
      // Create a test club
      savedClub = await new Club({
        name: 'Test Club',
        description: 'Club for testing findById',
        type: 'ACADEMIC',
        status: 'ACTIVE',
        logo_url: 'http://example.com/logo.png',
        website_url: 'http://example.com',
        created_by: new mongoose.Types.ObjectId()
      }).save();
    });

    test('should find a club by its ID', async () => {
      const result = await ClubModel.findById(savedClub._id);
      expect(result).not.toBeNull();
      expect(result.name).toBe('Test Club');
    });

    test('should return null for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const result = await ClubModel.findById(nonExistentId);
      expect(result).toBeNull();
    });
  });

  // Test for create method
  describe('create', () => {
    test('should create a new club', async () => {
      const result = await ClubModel.create(testClubData);
      
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(testClubData.name);
      expect(result.description).toBe(testClubData.description);
      expect(result.type).toBe(testClubData.type);
      
      // Check that it's actually saved in the database
      const savedClub = await Club.findById(result.id);
      expect(savedClub).not.toBeNull();
    });

    test('should set default status to active if not provided', async () => {
      const result = await ClubModel.create(testClubData);
      expect(result.status).toBe('ACTIVE');
    });

    test('should throw error for duplicate club name', async () => {
      // First create a club
      await ClubModel.create(testClubData);
      
      // Try to create another club with the same name
      await expect(ClubModel.create(testClubData)).rejects.toThrow();
    });
  });

  // Test for findRecruitments method
  describe('findRecruitments', () => {
    let testClub;
    let clubId;
    
    beforeEach(async () => {
      // Create a test club
      testClub = await new Club({
        name: 'Recruitment Test Club',
        description: 'Club for testing recruitments',
        type: 'ACADEMIC',
        created_by: new mongoose.Types.ObjectId()
      }).save();
      
      clubId = testClub._id;
      
      // We need to use the RecruitmentRound model directly
      const { RecruitmentRound } = require('../../src/config/database');
      
      // Create some test recruitment rounds
      await Promise.all([
        new RecruitmentRound({
          club_id: clubId,
          title: 'Spring Recruitment',
          description: 'Spring recruitment round',
          start_at: new Date('2025-01-15'),
          end_at: new Date('2025-01-30'),
          status: 'OPEN',
          created_by: new mongoose.Types.ObjectId()
        }).save(),
        new RecruitmentRound({
          club_id: clubId,
          title: 'Fall Recruitment',
          description: 'Fall recruitment round',
          start_at: new Date('2025-08-15'),
          end_at: new Date('2025-08-30'),
          status: 'CLOSED',
          created_by: new mongoose.Types.ObjectId()
        }).save()
      ]);
    });
    
    test('should find all recruitment rounds for a club', async () => {
      const recruitments = await ClubModel.findRecruitments(clubId);
      
      expect(recruitments.length).toBe(2);
      expect(recruitments[0]).toHaveProperty('id');
      expect(recruitments[0]).toHaveProperty('title');
      expect(recruitments[0]).toHaveProperty('start_at');
      expect(recruitments[0]).toHaveProperty('status');
    });
    
    test('should return empty array for club with no recruitment rounds', async () => {
      const anotherClub = await new Club({
        name: 'Club Without Recruitments',
        description: 'This club has no recruitment rounds',
        type: 'CULTURAL',
        created_by: new mongoose.Types.ObjectId()
      }).save();
      
      const recruitments = await ClubModel.findRecruitments(anotherClub._id);
      expect(recruitments).toHaveLength(0);
    });
  });
  
  // Test for updateSize method
  describe('updateSize', () => {
    let testClub;
    
    beforeEach(async () => {
      // Create a test club
      testClub = await new Club({
        name: 'Size Test Club',
        description: 'Club for testing size updates',
        type: 'ACADEMIC',
        created_by: new mongoose.Types.ObjectId()
      }).save();
    });
    
    test('should update club size', async () => {
      const newSize = 42;
      
      await ClubModel.updateSize(testClub._id, newSize);
      
      // Verify the size was updated
      const updatedClub = await Club.findById(testClub._id);
      expect(updatedClub.size).toBe(newSize);
    });
  });
});
