const Club = require('../models/club');

// Simple input sanitization function
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

const getClubs = async (req, res, next) => {
  try {
    // US007: Enhanced search and filtering parameters
    const { 
      name, 
      type, 
      category, 
      status, 
      location, 
      search, 
      page, 
      limit, 
      sort 
    } = req.query;
    
    // Validate pagination parameters
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    
    if (page && (isNaN(pageNumber) || pageNumber < 1)) {
      const error = new Error('Page must be a positive integer');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }
    
    if (limit && (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100)) {
      const error = new Error('Limit must be a positive integer between 1 and 100');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }
    
    // US007: Validate sort parameter
    const validSortOptions = ['name', 'name_desc', 'category', 'location', 'newest', 'oldest', 'relevance'];
    if (sort && !validSortOptions.includes(sort)) {
      const error = new Error(`Invalid sort option. Must be one of: ${validSortOptions.join(', ')}`);
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }
    
    // US007: Validate category parameter
    const validCategories = ['academic', 'sports', 'arts', 'technology', 'social', 'volunteer', 'cultural', 'other'];
    if (category && !validCategories.includes(category)) {
      const error = new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }
    
    // Sanitize search inputs
    const sanitizedParams = {
      name: name ? sanitizeInput(name) : undefined,
      type: type ? sanitizeInput(type) : undefined,
      category: category ? sanitizeInput(category) : undefined,
      status: status ? sanitizeInput(status) : undefined,
      location: location ? sanitizeInput(location) : undefined,
      search: search ? sanitizeInput(search) : undefined,
      page: pageNumber,
      limit: limitNumber,
      sort: sort ? sanitizeInput(sort) : undefined
    };
    
    console.log('🔍 Club search request:', {
      searchParams: sanitizedParams,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    
    const clubs = await Club.findAll(sanitizedParams);
    
    res.status(200).json({
      success: true,
      message: 'Clubs retrieved successfully',
      data: clubs,
      meta: {
        searchParams: sanitizedParams,
        timestamp: new Date().toISOString()
      }
    });
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
      category: club.category,
      location: club.location,
      contact_email: club.contact_email,
      contact_phone: club.contact_phone,
      logo_url: club.logo_url,
      website_url: club.website_url,
      social_links: club.social_links,
      settings: club.settings,
      status: club.status,
      member_count: club.size || 0,
      created_by: club.created_by,
      // Backward compatibility
      type: club.type,
      size: club.size || 0
    });
  } catch (error) {
    next(error);
  }
};

const createClub = async (req, res, next) => {
  try {
    const { 
      name, 
      description, 
      category,
      location,
      contact_email,
      contact_phone,
      logo_url, 
      website_url,
      social_links,
      settings,
      // Backward compatibility
      type 
    } = req.body;
    
    // Validate required fields
    if (!name || (!category && !type)) {
      const error = new Error('Name and category are required');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }
    
    // Validate data types
    if (name && typeof name !== 'string') {
      const error = new Error('Name must be a string');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }
    
    if (description && typeof description !== 'string') {
      const error = new Error('Description must be a string');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }
    
    if (location && typeof location !== 'string') {
      const error = new Error('Location must be a string');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }
    
    // Sanitize string inputs
    const sanitizedData = {
      name: sanitizeInput(name),
      description: sanitizeInput(description),
      category: category || type,
      location: sanitizeInput(location),
      contact_email: contact_email,
      contact_phone: contact_phone,
      logo_url: logo_url,
      website_url: website_url,
      social_links: social_links,
      settings: settings,
      status: 'ACTIVE',
      created_by: req.user?.id,
      // Backward compatibility
      type: type || category
    };
    
    const newClub = await Club.create(sanitizedData);
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
    const { status, page, limit } = req.query;
    
    // Validate pagination parameters
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    
    if (page && (isNaN(pageNumber) || pageNumber < 1)) {
      const error = new Error('Page must be a positive integer');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }
    
    if (limit && (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100)) {
      const error = new Error('Limit must be a positive integer between 1 and 100');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }
    
    const club = await Club.findById(id);
    if (!club) {
      const error = new Error('Club not found');
      error.status = 404;
      error.name = 'CLUB_NOT_FOUND';
      throw error;
    }
    
    const result = await Club.findRecruitments(id, { status, page: pageNumber, limit: limitNumber });
    
    // Format response with pagination metadata
    const response = {
      total: result.total || 0,
      page: pageNumber,
      totalPages: Math.ceil((result.total || 0) / limitNumber),
      results: result.recruitments?.map(r => ({ 
        id: r.id, 
        title: r.title, 
        start_date: r.start_date,
        start_at: r.start_at, 
        status: r.status 
      })) || []
    };
    
    res.status(200).json(response);
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

// US007: Get available categories for filtering
const getCategories = async (req, res, next) => {
  try {
    const categories = await Club.getCategories();
    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// US007: Get available locations for filtering
const getLocations = async (req, res, next) => {
  try {
    const locations = await Club.getLocations();
    res.status(200).json({
      success: true,
      message: 'Locations retrieved successfully',
      data: locations
    });
  } catch (error) {
    next(error);
  }
};

// US007: Get club statistics for search context
const getStats = async (req, res, next) => {
  try {
    const stats = await Club.getStats();
    res.status(200).json({
      success: true,
      message: 'Club statistics retrieved successfully',
      data: stats
    });
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
  getStats
};
