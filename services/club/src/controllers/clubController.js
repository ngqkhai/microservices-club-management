const Club = require('../models/club');

const getClubs = async (req, res, next) => {
  try {
    const { name, type, status, page, limit } = req.query;
    const clubs = await Club.findAll({ name, type, status, page, limit });
    res.status(200).json(clubs);
  } catch (error) {
    next(error);
  }
};

const getClubById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const club = await Club.findById(id);
    if (!club) {
      const error = new Error('Club not found');
      error.status = 404;
      error.name = 'CLUB_NOT_FOUND';
      throw error;
    }
    res.status(200).json({
      id: club.id,
      name: club.name,
      description: club.description,
      type: club.type,
      size: club.size || 0,
      logo_url: club.logo_url,
      website_url: club.website_url,
      status: club.status
    });
  } catch (error) {
    next(error);
  }
};

const createClub = async (req, res, next) => {
  try {
    const { name, description, type, logo_url, website_url } = req.body;
    if (!name || !type) {
      const error = new Error('Name and type are required');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }
    const created_by = req.user?.id;
    const newClub = await Club.create({ name, description, type, status: 'ACTIVE', logo_url, website_url, created_by });
    res.status(201).json(newClub);
  } catch (error) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
      const duplicateError = new Error('Club with this name already exists');
      duplicateError.status = 409;
      duplicateError.name = 'DUPLICATE_ENTITY';
      return next(duplicateError);
    }
    next(error);
  }
};

const getClubRecruitments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const club = await Club.findById(id);
    if (!club) {
      const error = new Error('Club not found');
      error.status = 404;
      error.name = 'CLUB_NOT_FOUND';
      throw error;
    }
    const recruitments = await Club.findRecruitments(id);
    const formattedRecruitments = recruitments.map(r => ({ id: r.id, title: r.title, start_at: r.start_at, status: r.status }));
    res.status(200).json(formattedRecruitments);
  } catch (error) {
    next(error);
  }
};

const getClubMember = async (req, res, next) => {
  try {
    const { clubId, userId } = req.params;
    const membership = await Club.findMembership(clubId, userId);
    if (!membership) {
      const error = new Error('Membership not found');
      error.status = 404;
      error.name = 'MEMBERSHIP_NOT_FOUND';
      throw error;
    }
    res.status(200).json(membership);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClubs,
  getClubById,
  createClub,
  getClubRecruitments,
  getClubMember,
};
