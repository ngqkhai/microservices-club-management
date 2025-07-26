const Club = require('../models/club');
const authServiceClient = require('../utils/authServiceClient');
const eventServiceClient = require('../utils/eventServiceClient');

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
   * Get a club by ID with additional data (recruitments, statistics)
   * @param {string} clubId - The club ID
   * @returns {Promise<Object>} - Club details with additional information
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

      // Get additional data for the club
      const [currentRecruitments, recruitmentStats, upcomingEvents, publishedEvents, eventStats] = await Promise.all([
        this._getCurrentRecruitments(clubId),
        this._getRecruitmentStatistics(clubId),
        this._getUpcomingEvents(clubId),
        this._getPublishedEvents(clubId),
        this._getEventStatistics(clubId)
      ]);

      return {
        success: true,
        message: 'Club retrieved successfully',
        data: {
          ...club,
          current_recruitments: currentRecruitments,
          total_recruitments: recruitmentStats.total_recruitments,
          active_recruitments: recruitmentStats.active_recruitments,
          upcoming_events: upcomingEvents,
          published_events: publishedEvents,
          total_events: eventStats.total_events
        }
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
      status,
      manager_user_id,
      manager_full_name,
      manager_email,
      type // Backward compatibility
    } = clubData;
    
    // Validate required fields based on MongoDB schema
    // Required: name, category, status, manager, created_by
    if (!name || (!category && !type)) {
      const error = new Error('Name and category are required');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }
    
    // Validate manager fields (manager object is required)
    if (!manager_user_id || !manager_full_name) {
      const error = new Error('Manager user ID and full name are required');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }
    
    // Validate data types for required fields
    this._validateStringField(name, 'Name');
    this._validateStringField(category || type, 'Category');
    this._validateStringField(manager_user_id, 'Manager user ID');
    this._validateStringField(manager_full_name, 'Manager full name');
    
    // Validate optional fields if provided
    if (description) this._validateStringField(description, 'Description');
    if (location) this._validateStringField(location, 'Location');
    
    // Validate manager email if provided
    if (manager_email && (typeof manager_email !== 'string' || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(manager_email))) {
      const error = new Error('Manager email must be a valid email address');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }
    
    // Validate status field
    if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
      const error = new Error('Status must be either ACTIVE or INACTIVE');
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
      
      // Ensure manager email is provided (required by MongoDB validation)
      if (!finalManagerEmail) {
        const error = new Error('Manager email is required but not found in auth service');
        error.status = 400;
        error.name = 'VALIDATION_ERROR';
        throw error;
      }
      
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
    
    // Build sanitized club data according to MongoDB schema
    const sanitizedClubData = {
      name: this._sanitizeInput(name),
      category: category || type,
      status: status || 'ACTIVE', // Default to ACTIVE if not provided
      member_count: parseInt(1), // Default member count (the creator) - must be integer
      created_by: userContext.userId,
      manager: {
        user_id: manager_user_id,
        full_name: finalManagerFullName,
        email: finalManagerEmail,
        assigned_at: new Date().toISOString()
      },
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Add optional fields only if they have values
    if (description) {
      sanitizedClubData.description = this._sanitizeInput(description);
    }
    if (location) {
      sanitizedClubData.location = this._sanitizeInput(location);
    }
    if (contact_email) {
      sanitizedClubData.contact_email = this._sanitizeInput(contact_email);
    }
    if (contact_phone) {
      sanitizedClubData.contact_phone = this._sanitizeInput(contact_phone);
    }
    if (logo_url) {
      sanitizedClubData.logo_url = this._sanitizeUrl(logo_url);
    }
    if (website_url) {
      sanitizedClubData.website_url = this._sanitizeUrl(website_url);
    }
    if (social_links && Object.keys(social_links).length > 0) {
      sanitizedClubData.social_links = this._sanitizeSocialLinks(social_links);
    }
    if (settings && Object.keys(settings).length > 0) {
      // Ensure settings object has proper types according to schema
      const sanitizedSettings = {};
      if (typeof settings.is_public === 'boolean') {
        sanitizedSettings.is_public = settings.is_public;
      }
      if (typeof settings.requires_approval === 'boolean') {
        sanitizedSettings.requires_approval = settings.requires_approval;
      }
      if (typeof settings.max_members === 'number' && settings.max_members >= 1) {
        sanitizedSettings.max_members = parseInt(settings.max_members);
      }
      if (Object.keys(sanitizedSettings).length > 0) {
        sanitizedClubData.settings = sanitizedSettings;
      }
    }
    
    // Add backward compatibility field
    sanitizedClubData.type = type || category;
    
    try {
      console.log('Creating club with data:', JSON.stringify(sanitizedClubData, null, 2));
      
      // Log the required fields to ensure they're all present
      console.log('MongoDB Schema Required Fields Check:', {
        name: !!sanitizedClubData.name,
        category: !!sanitizedClubData.category,
        status: !!sanitizedClubData.status,
        manager: !!sanitizedClubData.manager,
        created_by: !!sanitizedClubData.created_by
      });
      
      console.log('Optional Fields Present:', {
        description: !!sanitizedClubData.description,
        location: !!sanitizedClubData.location,
        contact_email: !!sanitizedClubData.contact_email,
        contact_phone: !!sanitizedClubData.contact_phone,
        logo_url: !!sanitizedClubData.logo_url,
        website_url: !!sanitizedClubData.website_url,
        social_links: !!sanitizedClubData.social_links,
        settings: !!sanitizedClubData.settings
      });
      
      console.log('Manager Object Details:', {
        user_id: !!sanitizedClubData.manager?.user_id,
        full_name: !!sanitizedClubData.manager?.full_name,
        email: !!sanitizedClubData.manager?.email,
        assigned_at: !!sanitizedClubData.manager?.assigned_at
      });
      
      const newClub = await Club.create(sanitizedClubData);
      
      console.log('✅ Club created successfully:', {
        club_id: newClub.id,
        name: newClub.name,
        category: newClub.category,
        manager: newClub.manager.user_id,
        member_count: newClub.member_count,
        created_by: userContext.userId
      });
      
      // Create membership record for the club creator/manager
      const { Membership } = require('../config/database');
      
      try {
        // Ensure we have the club ID (try different possible fields)
        const clubId = newClub._id || newClub.id;
        
        if (!clubId) {
          throw new Error('Club ID not found in created club document');
        }
        
        const membershipData = {
          club_id: clubId,
          user_id: userContext.userId,
          user_email: manager_email || userContext.email,
          user_full_name: manager_full_name || userContext.full_name,
          role: 'club_manager',
          status: 'active',
          application_message: 'Club creator - automatically approved',
          approved_by: userContext.userId,
          approved_at: new Date(),
          joined_at: new Date()
        };
        
        console.log('Creating membership with data:', {
          club_id: clubId,
          user_id: userContext.userId,
          role: 'club_manager',
          status: 'active'
        });
        
        const membership = await Membership.create(membershipData);
        
        console.log('✅ Membership created for club creator:', {
          membership_id: membership._id || membership.id,
          club_id: clubId,
          user_id: userContext.userId,
          role: 'club_manager',
          status: 'active'
        });
        
      } catch (membershipError) {
        console.error('❌ Error creating membership for club creator:', membershipError);
        console.error('Club object fields:', Object.keys(newClub));
        console.error('newClub._id:', newClub._id);
        console.error('newClub.id:', newClub.id);
        // Don't throw error here as club was created successfully
        // This is a secondary operation that shouldn't fail the main flow
      }
      
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
      
      if (error.name === 'MongoServerError' && error.message.includes('Document failed validation')) {
        console.error('❌ MongoDB validation failed:', {
          error: error.message,
          errInfo: error.errInfo,
          schemaRulesNotSatisfied: error.errInfo?.details?.schemaRulesNotSatisfied,
          data: sanitizedClubData
        });
        
        // Log detailed schema validation errors
        if (error.errInfo?.details?.schemaRulesNotSatisfied) {
          console.error('Schema validation details:', JSON.stringify(error.errInfo.details.schemaRulesNotSatisfied, null, 2));
        }
        
        const validationError = new Error('Club data validation failed. Please check required fields.');
        validationError.status = 400;
        validationError.name = 'VALIDATION_ERROR';
        validationError.details = error.errInfo;
        throw validationError;
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
  /**
   * Get a specific club member's details
   * @param {string} clubId - The club ID
   * @param {string} userId - The user ID
   * @param {Object} userContext - User context for permission check
   * @returns {Promise<Object>} - Club member details
   */
  async getClubMember(clubId, userId, userContext) {
    if (!clubId || !userId) {
      const error = new Error('Club ID and User ID are required');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }

    // Check if user has permission to view member details (all club members can view)
    const hasPermission = await this._checkClubPermission(clubId, userContext.userId, ['club_manager', 'organizer', 'member']);
    if (!hasPermission) {
      const error = new Error('You do not have permission to view club member details');
      error.status = 403;
      error.name = 'PERMISSION_ERROR';
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
  
  /**
   * Update club status
   * @param {string} clubId - The club ID
   * @param {string} status - The new status (ACTIVE or INACTIVE)
   * @param {Object} userContext - User context from request
   * @returns {Promise<Object>} - Updated club
   */
  async updateClubStatus(clubId, status, userContext) {
    if (!clubId) {
      const error = new Error('Club ID is required');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }
    
    if (!status || !['ACTIVE', 'INACTIVE'].includes(status)) {
      const error = new Error('Status must be either ACTIVE or INACTIVE');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }
    
    try {
      const updatedClub = await Club.updateStatus(clubId, status);
      
      if (!updatedClub) {
        const error = new Error('Club not found');
        error.status = 404;
        error.name = 'NOT_FOUND';
        throw error;
      }
      
      console.log('✅ Club status updated:', {
        club_id: clubId,
        new_status: status,
        updated_by: userContext.userId
      });
      
      return {
        success: true,
        message: 'Club status updated successfully',
        data: updatedClub
      };
      
    } catch (error) {
      if (error.name === 'CastError') {
        const castError = new Error('Invalid club ID format');
        castError.status = 400;
        castError.name = 'VALIDATION_ERROR';
        throw castError;
      }
      
      console.error('❌ Error updating club status:', error);
      throw error;
    }
  }
  
  /**
   * Get all club roles for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} - User's club roles
   */
  async getUserClubRoles(userId) {
    if (!userId) {
      const error = new Error('User ID is required');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }

    try {
      const { Membership } = require('../config/database');
      const memberships = await Membership.find({
        user_id: userId,
        status: 'active'
      });

      console.log(`Found ${memberships.length} memberships for user ${userId}`);
      
      const roles = [];
      
      for (const membership of memberships) {
        try {
          // Get club details manually to avoid populate issues
          const club = await Club.findById(membership.club_id);
          
          if (club) {
            roles.push({
              clubId: membership.club_id.toString(),
              clubName: club.name,
              role: membership.role,
              joinedAt: membership.joined_at
            });
            console.log(`✅ Found club: ${club.name} for user ${userId}`);
          } else {
            // Club not found, log but don't fail
            console.warn(`⚠️  Club with ID ${membership.club_id} not found for user ${userId}`);
          }
        } catch (clubError) {
          console.error(`❌ Error fetching club ${membership.club_id}:`, clubError);
          // Continue processing other memberships
        }
      }

      return {
        success: true,
        message: 'User club roles retrieved successfully',
        data: roles
      };
    } catch (error) {
      console.error('Error getting user club roles:', error);
      throw error;
    }
  }

  /**
   * Get all members of a club
   * @param {string} clubId - The club ID
   * @param {Object} userContext - User context for permission check
   * @returns {Promise<Object>} - Club members
   */
  async getClubMembers(clubId, userContext) {
    if (!clubId) {
      const error = new Error('Club ID is required');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }

    // Check if user has permission to view members (all club members can view)
    const hasPermission = await this._checkClubPermission(clubId, userContext.userId, ['club_manager', 'organizer', 'member']);
    if (!hasPermission) {
      const error = new Error('You do not have permission to view club members');
      error.status = 403;
      error.name = 'PERMISSION_ERROR';
      throw error;
    }

    try {
      const { Membership } = require('../config/database');
      const members = await Membership.find({
        club_id: clubId,
        status: 'active'
      }).select('user_id role joined_at user_email user_full_name');

      return {
        success: true,
        message: 'Club members retrieved successfully',
        data: members
      };
    } catch (error) {
      console.error('Error getting club members:', error);
      throw error;
    }
  }

  /**
   * Add a member to a club
   * @param {string} clubId - The club ID
   * @param {Object} memberData - Member data
   * @param {Object} userContext - User context for permission check
   * @returns {Promise<Object>} - Created membership
   */
  async addClubMember(clubId, memberData, userContext) {
    if (!clubId) {
      const error = new Error('Club ID is required');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }

    // Check if user has permission to add members
    const hasPermission = await this._checkClubPermission(clubId, userContext.userId, ['club_manager']);
    if (!hasPermission) {
      const error = new Error('You do not have permission to add members to this club');
      error.status = 403;
      error.name = 'PERMISSION_ERROR';
      throw error;
    }

    try {
      const { Membership } = require('../config/database');
      
      const membershipData = {
        club_id: clubId,
        user_id: memberData.userId,
        role: memberData.role || 'member',
        status: 'active',
        approved_by: userContext.userId,
        approved_at: new Date()
      };
      
      // Include user email and full name if provided
      if (memberData.userEmail) {
        membershipData.user_email = memberData.userEmail;
      }
      if (memberData.userFullName) {
        membershipData.user_full_name = memberData.userFullName;
      }
      
      const membership = await Membership.create(membershipData);

      return {
        success: true,
        message: 'Member added successfully',
        data: membership
      };
    } catch (error) {
      if (error.code === 11000) {
        const duplicateError = new Error('User is already a member of this club');
        duplicateError.status = 409;
        duplicateError.name = 'DUPLICATE_ERROR';
        throw duplicateError;
      }
      console.error('Error adding club member:', error);
      throw error;
    }
  }

  /**
   * Update a member's role in a club
   * @param {string} clubId - The club ID
   * @param {string} userId - The user ID
   * @param {string} newRole - The new role
   * @param {Object} userContext - User context for permission check
   * @returns {Promise<Object>} - Updated membership
   */
  async updateMemberRole(clubId, userId, newRole, userContext) {
    if (!clubId || !userId || !newRole) {
      const error = new Error('Club ID, User ID, and new role are required');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }

    // Check if user has permission to update member roles
    const hasPermission = await this._checkClubPermission(clubId, userContext.userId, ['club_manager']);
    if (!hasPermission) {
      const error = new Error('You do not have permission to update member roles in this club');
      error.status = 403;
      error.name = 'PERMISSION_ERROR';
      throw error;
    }

    try {
      const { Membership } = require('../config/database');
      const membership = await Membership.findOneAndUpdate(
        { club_id: clubId, user_id: userId, status: 'active' },
        { role: newRole, updated_at: new Date() },
        { new: true }
      );

      if (!membership) {
        const error = new Error('Member not found in this club');
        error.status = 404;
        error.name = 'NOT_FOUND';
        throw error;
      }

      return {
        success: true,
        message: 'Member role updated successfully',
        data: membership
      };
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  }

  /**
   * Remove a member from a club
   * @param {string} clubId - The club ID
   * @param {string} userId - The user ID
   * @param {Object} userContext - User context for permission check
   * @returns {Promise<Object>} - Removal result
   */
  async removeMember(clubId, userId, userContext) {
    if (!clubId || !userId) {
      const error = new Error('Club ID and User ID are required');
      error.status = 400;
      error.name = 'VALIDATION_ERROR';
      throw error;
    }

    // Check if user has permission to remove members
    const hasPermission = await this._checkClubPermission(clubId, userContext.userId, ['club_manager']);
    if (!hasPermission) {
      const error = new Error('You do not have permission to remove members from this club');
      error.status = 403;
      error.name = 'PERMISSION_ERROR';
      throw error;
    }

    try {
      const { Membership } = require('../config/database');
      const membership = await Membership.findOneAndUpdate(
        { club_id: clubId, user_id: userId, status: 'active' },
        { 
          status: 'removed',
          removed_at: new Date(),
          updated_at: new Date()
        },
        { new: true }
      );

      if (!membership) {
        const error = new Error('Member not found in this club');
        error.status = 404;
        error.name = 'NOT_FOUND';
        throw error;
      }

      return {
        success: true,
        message: 'Member removed successfully',
        data: membership
      };
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }

  /**
   * Check if user has permission for club operations
   * @param {string} clubId - The club ID
   * @param {string} userId - The user ID
   * @param {Array} allowedRoles - Array of allowed roles
   * @returns {Promise<boolean>} - Has permission
   */
  async _checkClubPermission(clubId, userId, allowedRoles = ['club_manager']) {
    try {
      const { Membership } = require('../config/database');
      const membership = await Membership.findOne({
        club_id: clubId,
        user_id: userId,
        status: 'active',
        role: { $in: allowedRoles }
      });

      return !!membership;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
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

  /**
   * Get current active recruitment campaigns for a club
   * @param {string} clubId - The club ID
   * @returns {Promise<Array>} - Array of current recruitment campaigns
   */
  async _getCurrentRecruitments(clubId) {
    try {
      const { RecruitmentCampaign } = require('../config/database');
      const currentDate = new Date();
      
      const recruitments = await RecruitmentCampaign.find({
        club_id: clubId,
        status: 'published'
      })
      .select('title description requirements start_date end_date max_applications statistics')
      .sort({ start_date: -1 })
      .limit(5); // Limit to 5 most recent active recruitments

      return recruitments.map(recruitment => ({
        id: recruitment._id,
        title: recruitment.title,
        description: recruitment.description,
        requirements: recruitment.requirements,
        start_date: recruitment.start_date,
        end_date: recruitment.end_date,
        max_applications: recruitment.max_applications,
        applications_count: recruitment.statistics?.total_applications || 0,
        status: 'active'
      }));
    } catch (error) {
      console.error('Error getting current recruitments:', error);
      return [];
    }
  }

  /**
   * Get recruitment statistics for a club
   * @param {string} clubId - The club ID
   * @returns {Promise<Object>} - Recruitment statistics
   */
  async _getRecruitmentStatistics(clubId) {
    try {
      const { RecruitmentCampaign } = require('../config/database');
      const currentDate = new Date();
      
      const [totalCount, activeCount] = await Promise.all([
        RecruitmentCampaign.countDocuments({ club_id: clubId }),
        RecruitmentCampaign.countDocuments({
          club_id: clubId,
          status: 'published',
          start_date: { $lte: currentDate },
          end_date: { $gte: currentDate }
        })
      ]);

      return {
        total_recruitments: totalCount,
        active_recruitments: activeCount
      };
    } catch (error) {
      console.error('Error getting recruitment statistics:', error);
      return {
        total_recruitments: 0,
        active_recruitments: 0
      };
    }
  }

  /**
   * Get published events for a club from Event service
   * @param {string} clubId - The club ID
   * @returns {Promise<Array>} - Published events
   */
  async _getPublishedEvents(clubId) {
    try {
      const requestContext = {
        // Add basic context for API Gateway validation
        service: 'club-service'
      };
      
      const publishedEvents = await eventServiceClient.getPublishedClubEvents(clubId, {
        status: 'published',
        limit: 10 // Limit to 10 most recent published events
      });
      
      return publishedEvents.map(event => ({
        id: event.id || event._id,
        title: event.title,
        description: event.description,
        short_description: event.short_description,
        category: event.category,
        location: event.location,
        start_date: event.start_date,
        end_date: event.end_date,
        participation_fee: event.participation_fee || event.fee || 0,
        currency: event.currency || 'USD',
        max_participants: event.max_participants || event.max_attendees,
        status: event.status,
        visibility: event.visibility,
        statistics: event.statistics || {
          total_registrations: 0,
          total_interested: 0,
          total_attended: 0
        },
        created_at: event.created_at,
        updated_at: event.updated_at
      }));
    } catch (error) {
      console.error('Error getting published events:', error);
      return [];
    }
  }

  /**
   * Get upcoming events for a club from Event service
   * @param {string} clubId - The club ID
   * @returns {Promise<Array>} - Array of upcoming events
   */
  async _getUpcomingEvents(clubId) {
    try {
      const requestContext = {
        // Add basic context for API Gateway validation
        service: 'club-service'
      };
      
      const upcomingEvents = await eventServiceClient.getUpcomingClubEvents(clubId, requestContext);
      
      return upcomingEvents.map(event => ({
        id: event.id || event._id,
        title: event.title || event.name,
        description: event.description,
        date: event.date || event.start_date,
        time: event.time || event.start_time,
        location: event.location || event.venue,
        fee: event.fee || event.price || 0,
        max_participants: event.max_participants || event.capacity,
        current_participants: event.current_participants || event.registered_count || 0,
        status: event.status || 'active'
      }));
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      return [];
    }
  }

  /**
   * Get event statistics for a club from Event service
   * @param {string} clubId - The club ID
   * @returns {Promise<Object>} - Event statistics
   */
  async _getEventStatistics(clubId) {
    try {
      const requestContext = {
        // Add basic context for API Gateway validation
        service: 'club-service'
      };
      
      const eventStats = await eventServiceClient.getEventStatistics(clubId, requestContext);
      
      return {
        total_events: eventStats.total_events || 0,
        upcoming_events: eventStats.upcoming_events || 0,
        past_events: eventStats.past_events || 0
      };
    } catch (error) {
      console.error('Error getting event statistics:', error);
      return {
        total_events: 0,
        upcoming_events: 0,
        past_events: 0
      };
    }
  }
}

module.exports = new ClubService();
