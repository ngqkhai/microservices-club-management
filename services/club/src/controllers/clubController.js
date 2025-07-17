const clubService = require('../services/clubService');

const getClubs = async (req, res, next) => {
  try {
    const result = await clubService.getClubs(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getClubById = async (req, res, next) => {
  try {
    const result = await clubService.getClubById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const createClub = async (req, res, next) => {
  try {
    const userContext = {
      userId: req.user?.id || req.headers['x-user-id'],
      userRole: req.user?.role || req.headers['x-user-role'],
      userEmail: req.user?.email || req.headers['x-user-email']
    };
    
    const result = await clubService.createClub(req.body, userContext);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const getClubRecruitments = async (req, res, next) => {
  try {
    const result = await clubService.getClubRecruitments(req.params.id, req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getClubMember = async (req, res, next) => {
  try {
    const result = await clubService.getClubMember(req.params.clubId, req.params.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const result = await clubService.getCategories();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getLocations = async (req, res, next) => {
  try {
    const result = await clubService.getLocations();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const result = await clubService.getStats();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const updateClubStatus = async (req, res, next) => {
  try {
    const userContext = {
      userId: req.user?.id || req.headers['x-user-id'],
      userRole: req.user?.role || req.headers['x-user-role'],
      userEmail: req.user?.email || req.headers['x-user-email']
    };
    
    const { status } = req.body;
    const result = await clubService.updateClubStatus(req.params.id, status, userContext);
    res.status(200).json(result);
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
  getCategories,
  getLocations,
  getStats,
  updateClubStatus
};
