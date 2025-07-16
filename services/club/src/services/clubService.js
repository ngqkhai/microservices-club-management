const Club = require('../models/club');
const authServiceClient = require('../utils/authServiceClient');

class ClubService {
  
  /**
   * Get all clubs with filtering, search, and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Clubs with pagination info
   */
  async getClubs(params) {
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
    } = params;
    
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
    
    // Validate sort parameter
    const validSortOptions = ['name', 'name_desc', 'category', 'location', 'newest', 'oldest', 'relevance'];
    if (sort && !validSortOptions.includes(sort)) {
      const error = new Error(`Invalid sort option. Valid options are: ${validSortOptions.join(', ')}`);
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }
    
    // Input sanitization
    const sanitizedParams = {
      name: this._sanitizeInput(name),
      type: this._sanitizeInput(type),
      category: this._sanitizeInput(category),
      status: this._sanitizeInput(status),
      location: this._sanitizeInput(location),
      search: this._sanitizeInput(search),
      page: pageNumber,
      limit: limitNumber,
      sort: sort
    };
    
    try {
      const result = await Club.findAll(sanitizedParams);
      
      return {
        success: true,
        message: 'Clubs retrieved successfully',
        data: result,
        pagination: {
          current_page: result.page,
          total_pages: result.totalPages,
          total_items: result.total,
          items_per_page: result.limit,
          has_next: result.page < result.totalPages,
          has_previous: result.page > 1
        }
      };
    } catch (error) {
      console.error('Error in getClubs service:', error);
      throw error;
    }
  }
  
  /**
   * Get a club by ID
   * @param {string} clubId - The club ID
   * @returns {Promise<Object>} - Club details
   */
  async getClubById(clubId) {
    if (!clubId) {
      const error = new Error('Club ID is required');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }
    
    try {
      const club = await Club.findById(clubId);
      
      if (!club) {
        const error = new Error('Club not found');
        error.status = 404;
        error.name = 'NOT_FOUND';
        throw error;
      }
      
      return {
        success: true,
        message: 'Club retrieved successfully',
        data: club
      };
    } catch (error) {
      if (error.name === 'CastError') {
        const castError = new Error('Invalid club ID format');
        castError.status = 400;
        castError.name = 'VALIDATION_ERROR';
        throw castError;
      }
      throw error;
    }
  }
  
  /**
   * Create a new club
   * @param {Object} clubData - Club creation data
   * @param {Object} userContext - User context from request
   * @returns {Promise<Object>} - Created club
   */
  async createClub(clubData, userContext) {
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
      manager_user_id,
      manager_full_name,
      manager_email,
      type // Backward compatibility
    } = clubData;
    
    // Validate required fields
    if (!name || (!category && !type)) {
      const error = new Error('Name and category are required');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }
    
    // Validate manager fields
    if (!manager_user_id || !manager_full_name) {
      const error = new Error('Manager user ID and full name are required');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }
    
    // Validate data types
    this._validateStringField(name, 'Name');
    this._validateStringField(description, 'Description');
    this._validateStringField(location, 'Location');
    this._validateStringField(manager_user_id, 'Manager user ID');
    this._validateStringField(manager_full_name, 'Manager full name');
    
    // Validate manager email if provided
    if (manager_email && (typeof manager_email !== 'string' || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(manager_email))) {
      const error = new Error('Manager email must be a valid email address');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }
    
    // Verify manager user exists
    let finalManagerEmail = manager_email;
    let finalManagerFullName = manager_full_name;
    
    try {
      const requestContext = {
        userId: userContext.userId,
        userRole: userContext.userRole
      };
      
      const managerUser = await authServiceClient.verifyUserExists(manager_user_id, requestContext);
      if (!managerUser) {
        const error = new Error('Manager user not found in auth database');
        error.status = 404;
        error.name = 'USER_NOT_FOUND';
        throw error;
      }
      
      // Log manager validation success
      console.log('✅ Manager user validated:', {
        user_id: manager_user_id,
        email: managerUser.data?.user?.email || managerUser.email,
        full_name: managerUser.data?.user?.full_name || managerUser.full_name,
        validated_by: requestContext.userId
      });
      
      // Use verified user information
      const verifiedUser = managerUser.data?.user || managerUser;
      const verifiedManagerEmail = verifiedUser.email;
      const verifiedManagerFullName = verifiedUser.full_name;
      
      finalManagerEmail = manager_email || verifiedManagerEmail;
      finalManagerFullName = manager_full_name || verifiedManagerFullName;
      
    } catch (authError) {
      console.error('❌ Manager validation failed:', authError.message);
      
      if (authError.name === 'USER_NOT_FOUND') {
        throw authError;
      }
      
      const error = new Error('Failed to validate manager user');
      error.status = 500;
      error.name = 'AUTH_SERVICE_ERROR';
      throw error;
    }
    
    // Sanitize inputs (URLs should not be HTML entity encoded)
    const sanitizedClubData = {
      name: this._sanitizeInput(name),
      description: this._sanitizeInput(description),
      category: category || type,
      location: this._sanitizeInput(location),
      contact_email: this._sanitizeInput(contact_email),
      contact_phone: this._sanitizeInput(contact_phone),
      logo_url: this._sanitizeUrl(logo_url),
      website_url: this._sanitizeUrl(website_url),
      social_links: this._sanitizeSocialLinks(social_links),
      settings: settings || {},
      created_by: userContext.userId,
      manager: {
        user_id: manager_user_id,
        full_name: finalManagerFullName,
        email: finalManagerEmail,
        assigned_at: new Date()
      },
      type: type || category // Backward compatibility
    };
    
    try {
      const newClub = await Club.create(sanitizedClubData);
      
      console.log('✅ Club created successfully:', {
        club_id: newClub.id,
        name: newClub.name,
        category: newClub.category,
        manager: newClub.manager.user_id,
        member_count: newClub.member_count,
        created_by: userContext.userId
      });
      
      return {
        success: true,
        message: 'Club created successfully',
        data: newClub
      };
      
    } catch (error) {
      if (error.name === 'MongoServerError' && error.code === 11000) {
        const duplicateError = new Error('Club name already exists');
        duplicateError.status = 409;
        duplicateError.name = 'DUPLICATE_ERROR';
        throw duplicateError;
      }
      
      console.error('❌ Error creating club:', error);
      throw error;
    }
  }
  
  /**
   * Get recruitment campaigns for a club
   * @param {string} clubId - The club ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Recruitment campaigns
   */
  async getClubRecruitments(clubId, options = {}) {
    if (!clubId) {
      const error = new Error('Club ID is required');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }
    
    try {
      const result = await Club.findRecruitments(clubId, options);
      
      return {
        success: true,
        message: 'Club recruitments retrieved successfully',
        data: result
      };
    } catch (error) {
      if (error.name === 'CastError') {
        const castError = new Error('Invalid club ID format');
        castError.status = 400;
        castError.name = 'VALIDATION_ERROR';
        throw castError;
      }
      throw error;
    }
  }
  
  /**
   * Get club member details
   * @param {string} clubId - The club ID
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} - Member details
   */
  async getClubMember(clubId, userId) {
    if (!clubId || !userId) {
      const error = new Error('Club ID and User ID are required');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }
    
    try {
      const membership = await Club.findMembership(clubId, userId);
      
      if (!membership) {
        const error = new Error('Member not found in this club');
        error.status = 404;
        error.name = 'NOT_FOUND';
        throw error;
      }
      
      return {
        success: true,
        message: 'Club member retrieved successfully',
        data: membership
      };
    } catch (error) {
      if (error.name === 'CastError') {
        const castError = new Error('Invalid club ID or user ID format');
        castError.status = 400;
        castError.name = 'VALIDATION_ERROR';
        throw castError;
      }
      throw error;
    }
  }
  
  /**
   * Get available club categories
   * @returns {Promise<Object>} - Available categories
   */
  async getCategories() {
    try {
      const categories = await Club.getCategories();
      
      return {
        success: true,
        message: 'Categories retrieved successfully',
        data: categories
      };
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }
  
  /**
   * Get available club locations
   * @returns {Promise<Object>} - Available locations
   */
  async getLocations() {
    try {
      const locations = await Club.getLocations();
      
      return {
        success: true,
        message: 'Locations retrieved successfully',
        data: locations
      };
    } catch (error) {
      console.error('Error getting locations:', error);
      throw error;
    }
  }
  
  /**
   * Get club statistics
   * @returns {Promise<Object>} - Club statistics
   */
  async getStats() {
    try {
      const stats = await Club.getStats();
      
      return {
        success: true,
        message: 'Club statistics retrieved successfully',
        data: stats
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }
  
  /**
   * Update club member count
   * @param {string} clubId - The club ID
   * @param {number} memberCount - The new member count
   * @returns {Promise<void>}
   */
  async updateMemberCount(clubId, memberCount) {
    if (!clubId) {
      const error = new Error('Club ID is required');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }
    
    if (typeof memberCount !== 'number' || memberCount < 0) {
      const error = new Error('Member count must be a non-negative number');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }
    
    try {
      await Club.updateMemberCount(clubId, memberCount);
      
      console.log('✅ Club member count updated:', {
        club_id: clubId,
        member_count: memberCount
      });
      
    } catch (error) {
      console.error('❌ Error updating member count:', error);
      throw error;
    }
  }
  
  // Private helper methods
  
  /**
   * Sanitize input string
   * @param {*} input - Input to sanitize
   * @returns {*} - Sanitized input
   */
  _sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  
  /**
   * Validate string field
   * @param {*} value - Value to validate
   * @param {string} fieldName - Field name for error message
   */
  _validateStringField(value, fieldName) {
    if (value && typeof value !== 'string') {
      const error = new Error(`${fieldName} must be a string`);
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }
  }
  
  /**
   * Sanitize social links object
   * @param {Object} socialLinks - Social links object
   * @returns {Object} - Sanitized social links
   */
  _sanitizeSocialLinks(socialLinks) {
    if (!socialLinks || typeof socialLinks !== 'object') {
      return {};
    }
    
    const sanitized = {};
    const allowedFields = ['facebook', 'instagram', 'twitter', 'linkedin'];
    
    for (const field of allowedFields) {
      if (socialLinks[field]) {
        sanitized[field] = this._sanitizeUrl(socialLinks[field]);
      }
    }
    
    return sanitized;
  }
  
  /**
   * Sanitize URL input (without breaking URL format)
   * @param {*} input - Input to sanitize
   * @returns {*} - Sanitized input
   */
  _sanitizeUrl(input) {
    if (typeof input !== 'string') return input;
    // For URLs, we only remove dangerous characters but keep URL structure intact
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
    // Note: We don't replace / in URLs as it's essential for URL structure
  }
}

module.exports = new ClubService();
