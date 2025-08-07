import { getEventsFromMock, createEventInDB, findEventById, updateEventInDB, deleteEventFromDB } from '../repositories/eventRepository.js';
import { generateRSVPQRCode } from '../utils/logger.js';
import { Event } from '../models/event.js';

import { Registration } from '../models/registration.js';
import mongoose from 'mongoose';
import axios from 'axios';

export async function getFilteredEvents(dto) {
  const result = await getEventsFromMock({
    filter: dto.filter,
    club_id: dto.club_id,
    status: dto.status,
    category: dto.category,
    location: dto.location,
    search: dto.search,
    start_from: dto.start_from,
    start_to: dto.start_to,
    page: dto.page,
    limit: dto.limit
  });

  // Format events to match the expected structure
  const formattedEvents = result.events.map(event => ({
    id: event._id,
    title: event.title,
    description: event.description,
    short_description: event.short_description,
    category: event.category,
    location: event.location,
    detailed_location: event.detailed_location,
    start_date: event.start_date,
    end_date: event.end_date,
    registration_deadline: event.registration_deadline,
    max_participants: event.max_participants,
    participation_fee: event.participation_fee,
    currency: event.currency,
    requirements: event.requirements,
    tags: event.tags,
    images: event.images,
    status: event.status,
    visibility: event.visibility,
    club_id: event.club_id,
    club: event.club_id ? {
      id: event.club_id._id || event.club_id.id,
      name: event.club_id.name,
      logo_url: event.club_id.logo_url,
      description: event.club_id.description
    } : null,
    organizers: event.organizers,
    statistics: event.statistics,
    created_by: event.created_by,
    created_at: event.created_at,
    updated_at: event.updated_at
  }));

  return {
    success: true,
    message: 'Events retrieved successfully',
    data: {
      events: formattedEvents,
      meta: result.meta
    },
    pagination: {
      current_page: result.meta.page,
      total_pages: result.meta.total_pages,
      total_items: result.meta.total,
      items_per_page: result.meta.limit,
      has_next: result.meta.has_next,
      has_previous: result.meta.has_previous
    }
  };
}

export async function rsvpToEvent(event_id, status, user_id) {
  const result = await generateRSVPQRCode(event_id, status, user_id);
  return result;
}

export async function joinEventService(eventId, userId) {
  try {
    console.log('joinEventService called with:', { eventId, userId });
    
    // Validate eventId format (MongoDB ObjectId)
    if (!eventId || !eventId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Invalid eventId format:', eventId);
      throw new Error('Event not found');
    }

    // Check database connection
    if (!mongoose.connection.readyState) {
      console.error('Database not connected');
      throw new Error('Database connection unavailable');
    }

    console.log('Searching for event with ID:', eventId);
    
    // Check if event exists
    const event = await Event.findById(eventId);
    console.log('Event found:', event ? 'Yes' : 'No');
    
    if (!event) {
      throw new Error('Event not found');
    }

    // Check if event is published and not cancelled
    if (event.status !== 'published') {
      throw new Error('Event is not available for joining');
    }

    // Check if user has already registered
    const existingRegistration = await Registration.findOne({
      event_id: eventId,
      user_id: userId,
      status: { $in: ['registered', 'attended'] } // Active registrations
    });

    if (existingRegistration) {
      throw new Error('You already joined this event');
    }

    // Check if event has reached maximum capacity
    const maxCapacity = event.max_participants;
    if (maxCapacity) {
      const currentParticipants = await Registration.countDocuments({
        event_id: eventId,
        status: { $in: ['registered', 'attended'] } // Only count active registrations
      });

      if (currentParticipants >= maxCapacity) {
        throw new Error('Event is full');
      }
    }

    // Create new registration record (joining event = registering for event)
    const registration = new Registration({
      event_id: eventId,
      user_id: userId,
      status: 'registered',
      registered_at: new Date()
    });

    await registration.save();

    return {
      eventId,
      userId,
      joinedAt: registration.registered_at,
      eventTitle: event.title,
      eventStartAt: event.start_date
    };
  } catch (error) {
    // Log the actual error for debugging
    console.error('joinEventService error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      eventId,
      userId,
      dbState: mongoose.connection.readyState
    });
    
    // Handle database connection errors
    if (error.message === 'Database connection unavailable') {
      throw new Error('Service temporarily unavailable');
    }
    
    // Re-throw the error to be handled by the controller
    throw error;
  }
}

export async function leaveEventService(eventId, userId) {
  try {
    console.log('leaveEventService called with:', { eventId, userId });
    
    // Validate eventId format (MongoDB ObjectId)
    if (!eventId || !eventId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Invalid eventId format:', eventId);
      throw new Error('Event not found');
    }

    // Check database connection
    if (!mongoose.connection.readyState) {
      console.error('Database not connected');
      throw new Error('Database connection unavailable');
    }

    console.log('Searching for event with ID:', eventId);
    
    // Check if event exists
    const event = await Event.findById(eventId);
    console.log('Event found:', event ? 'Yes' : 'No');
    
    if (!event) {
      throw new Error('Event not found');
    }

    // Check if user has registered for the event
    const existingRegistration = await Registration.findOne({
      event_id: eventId,
      user_id: userId,
      status: { $in: ['registered', 'attended'] } // Active registrations
    });

    if (!existingRegistration) {
      throw new Error('You have not joined this event');
    }

    // Update registration status to cancelled (or delete the record)
    await Registration.updateOne(
      { event_id: eventId, user_id: userId },
      { 
        status: 'cancelled', 
        cancelled_at: new Date(),
        cancellation_reason: 'User left event'
      }
    );

    return {
      eventId,
      userId,
      leftAt: new Date(),
      eventTitle: event.title,
      eventStartAt: event.start_date
    };
  } catch (error) {
    // Log the actual error for debugging
    console.error('leaveEventService error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      eventId,
      userId,
      dbState: mongoose.connection.readyState
    });
    
    // Handle database connection errors
    if (error.message === 'Database connection unavailable') {
      throw new Error('Service temporarily unavailable');
    }
    
    // Re-throw the error to be handled by the controller
    throw error;
  }
}

export const createEventService = async (eventData) => {
  let { 
    title, 
    description, 
    short_description,
    category,
    location, 
    start_date,
    end_date,
    registration_deadline,
    max_participants,
    participation_fee,
    currency,
    requirements,
    tags,
    images,
    attachments,
    status, 
    visibility,
    organizers,
    created_by, 
    club_id,
    // Backward compatibility
    start_at,
    end_at,
    max_attendees,
    fee
  } = eventData;

  // Handle field mapping for backward compatibility
  const startDate = start_date || start_at;
  const endDate = end_date || end_at;
  const maxCapacity = max_participants || max_attendees;
  const eventFee = participation_fee !== undefined ? participation_fee : fee;

  // 3.1: Validate required fields
  if (!title || !description || !startDate || !endDate || !created_by) {
    const error = new Error('Missing required fields: title, description, start_date, end_date, and created_by are required.');
    error.status = 400;
    throw error;
  }

  // 3.2: Validate rules
  if (new Date(startDate) <= new Date()) {
    const error = new Error('Event start date must be a future date.');
    error.status = 400;
    throw error;
  }

  if (new Date(endDate) <= new Date(startDate)) {
    const error = new Error('Event end date must be after start date.');
    error.status = 400;
    throw error;
  }

  if (maxCapacity && (!Number.isInteger(maxCapacity) || maxCapacity <= 0)) {
    const error = new Error('max_participants must be a positive integer.');
    error.status = 400;
    throw error;
  }

  // 3.3 / 7.2: Handle multi-club manager logic
  if (!club_id) {
    const clubServiceUrl = process.env.CLUB_SERVICE_URL || 'http://club-service:3002';
    // This endpoint is an assumption for the user service to get user's clubs
    const userClubsUrl = `${clubServiceUrl}/api/users/${created_by}/clubs?role=MANAGER`; 
    try {
      const response = await axios.get(userClubsUrl);
      const managedClubs = response.data.results;
      if (managedClubs && managedClubs.length === 1) {
        club_id = managedClubs[0].id;
      } else if (!managedClubs || managedClubs.length === 0) {
        const error = new Error('You do not manage any clubs.');
        error.status = 403;
        throw error;
      } else {
        const error = new Error('You manage multiple clubs. Please specify a club_id.');
        error.status = 400;
        throw error;
      }
    } catch (error) {
       // ... error handling for the axios call
    }
  }
  
  const newEventData = {
    title,
    description,
    short_description,
    category: category || 'other',
    location,
    start_date: startDate,
    end_date: endDate,
    registration_deadline,
    max_participants: maxCapacity,
    participation_fee: eventFee || 0,
    currency: currency || 'USD',
    requirements: requirements || [],
    tags: tags || [],
    images: images || [],
    attachments: attachments || [],
    status: status || 'draft',
    visibility: visibility || 'club_members',
    organizers: organizers || [],
    statistics: {
      total_registrations: 0,
      total_interested: 0,
      total_attended: 0
    },
    created_by,
    club_id: new mongoose.Types.ObjectId(club_id), // Convert to ObjectId
    // Backward compatibility fields
    start_at: startDate,
    end_at: endDate,
    max_attendees: maxCapacity,
    fee: eventFee || 0
  };
  
  const newEvent = await createEventInDB(newEventData);
  return newEvent;
};

export const updateEventService = async (eventId, eventData) => {
  // 4.1: Fetch the event by its ID
  const existingEvent = await findEventById(eventId);
  if (!existingEvent) {
    const error = new Error('Event not found');
    error.status = 404;
    throw error;
  }

  // 4.3: Ensure club_id is not changed
  if (eventData.club_id && !existingEvent.club_id.equals(new mongoose.Types.ObjectId(eventData.club_id))) {
    const error = new Error('Changing the club_id of an event is not allowed.');
    error.status = 400;
    throw error;
  }
  
  // 4.2: Apply validation to updated fields
  if (eventData.start_at && new Date(eventData.start_at) <= new Date()) {
    const error = new Error('Event start_at must be a future date.');
    error.status = 400;
    throw error;
  }

  const endAt = eventData.end_at || existingEvent.end_at;
  const startAt = eventData.start_at || existingEvent.start_at;
  if (new Date(endAt) <= new Date(startAt)) {
    const error = new Error('Event end_at must be after start_at.');
    error.status = 400;
    throw error;
  }
  
  // 4.4: Update the event in the repository
  const updatedEvent = await updateEventInDB(eventId, eventData);
  return updatedEvent;
};

export const deleteEventService = async (eventId) => {
  // 5.1: Fetch the event by its ID to ensure it exists
  const existingEvent = await findEventById(eventId);
  if (!existingEvent) {
    const error = new Error('Event not found');
    error.status = 404;
    throw error;
  }

  // 5.2: Check if event has registrations - optionally prevent deletion if there are active registrations
  const registrationCount = await Registration.countDocuments({ 
    event_id: eventId,
    status: { $in: ['registered', 'attended'] }
  });
  if (registrationCount > 0) {
    // Optional: You can either prevent deletion or allow it with cascade deletion
    // For now, let's allow deletion but clean up related data
    console.log(`Deleting event with ${registrationCount} active registrations. Related data will be cleaned up.`);
    
    // Clean up related registration records
    await Registration.deleteMany({ event_id: eventId });
  }

  // 5.3: Delete the event from the repository
  await deleteEventFromDB(eventId);
  
  return { message: 'Event and related data deleted successfully' };
};

export const getEventsOfClubService = async ({ clubId, status, start_from, start_to, page = 1, limit = 10 }) => {
    // 1. Xác thực và Xây dựng Query
    if (!mongoose.Types.ObjectId.isValid(clubId)) {
        throw new Error('Invalid club ID format');
    }

    const query = { club_id: new mongoose.Types.ObjectId(clubId) };
    const now = new Date();

    // Logic lọc theo ngày và trạng thái
    const dateConditions = [];

    // Xử lý bộ lọc trạng thái
    if (status === 'upcoming') {
        dateConditions.push({ start_date: { $gte: now } });
    } else if (status === 'published' || status === 'completed') {
        query.status = status;
    }

    // Xử lý bộ lọc khoảng thời gian tùy chỉnh
    const customDateRange = {};
    if (start_from) {
        customDateRange.$gte = new Date(start_from);
    }
    if (start_to) {
        customDateRange.$lte = new Date(start_to);
    }
    if (Object.keys(customDateRange).length > 0) {
        dateConditions.push({ start_date: customDateRange });
    }

    // Kết hợp tất cả các điều kiện liên quan đến ngày bằng $and
    if (dateConditions.length > 0) {
        query.$and = dateConditions;
    }

    // 2. Phân trang
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;

    // 3. Truy vấn DB
    // Sử dụng hai query riêng biệt cho đơn giản. Đối với nhu cầu hiệu suất rất cao,
    // hãy xem xét một query tổng hợp (aggregation) duy nhất với giai đoạn $facet.
    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
        .sort({ start_date: 1 })
        .skip(skip)
        .limit(pageSize)
        .lean(); // Dùng .lean() để query nhanh hơn, trả về đối tượng JS thuần túy

    // 4. Định dạng kết quả
    const getEventStatus = (event) => {
        // Ưu tiên trạng thái đã được lưu trong DB
        if (event.status) return event.status;

        const now = new Date();
        // Đảm bảo các ngày là đối tượng Date hợp lệ
        const startDate = event.start_date ? new Date(event.start_date) : null;
        const endDate = event.end_date ? new Date(event.end_date) : null;

        if (endDate && endDate < now) return 'past';
        if (startDate && startDate > now) return 'upcoming';
        if (startDate && endDate && startDate <= now && endDate >= now) return 'ongoing';
        
        // Giá trị mặc định nếu không thể xác định
        return 'unknown';
    };

    return {
        success: true,
        data: events.map(e => ({
            id: e._id,
            title: e.title,
            description: e.description,
            short_description: e.short_description,
            category: e.category,
            location: e.location,
            start_date: e.start_date,
            end_date: e.end_date,
            max_participants: e.max_participants ?? e.max_attendees,
            participation_fee: e.participation_fee ?? e.fee ?? 0,
            fee: e.fee ?? e.participation_fee ?? 0, // Tương thích ngược
            currency: e.currency ?? 'USD',
            status: getEventStatus(e),
            visibility: e.visibility,
            club_id: e.club_id,
            created_by: e.created_by,
            created_at: e.created_at,
            updated_at: e.updated_at,
            statistics: e.statistics ?? {
                total_registrations: 0,
                total_interested: 0,
                total_attended: 0
            }
        })),
        meta: {
            total,
            page: pageNumber,
            limit: pageSize,
            total_pages: Math.ceil(total / pageSize)
        }
    };
};

/**
 * Get individual event by ID with optional user context
 */
export const getEventByIdService = async (eventId, userId = null) => {
  try {
    const event = await Event.findById(eventId)
      .populate('club_id', 'name logo_url description')
      .lean();
      
    if (!event) {
      return null;
    }

    // Add user-specific data if userId provided
    let userStatus = null;
    if (userId) {
      userStatus = await getUserEventStatusService(eventId, userId);
    }

    // Calculate current participants
    const currentParticipants = await Registration.countDocuments({ 
      event_id: eventId, 
      status: 'registered' 
    });

    return {
      ...event,
      current_participants: currentParticipants,
      user_status: userStatus
    };
  } catch (error) {
    console.error('getEventByIdService error:', error);
    throw error;
  }
};

/**
 * Get user-specific event status (registration, favorite)
 */
export const getUserEventStatusService = async (eventId, userId) => {
  try {
    const registration = await Registration.findOne({ 
      event_id: eventId, 
      user_id: userId 
    });
    
    const favorite = await mongoose.connection.db.collection('event_interests').findOne({ 
      event_id: eventId, 
      user_id: userId,
      interest_type: 'favorite'
    });

    const event = await Event.findById(eventId);
    const canRegister = !registration && event && event.status === 'published';

    return {
      registration_status: registration?.status || 'not_registered',
      is_favorited: !!favorite,
      can_register: canRegister
    };
  } catch (error) {
    console.error('getUserEventStatusService error:', error);
    throw error;
  }
};

/**
 * Toggle event favorite status for user
 */
export const toggleEventFavoriteService = async (eventId, userId) => {
  try {
    const collection = mongoose.connection.db.collection('event_interests');
    
    const existing = await collection.findOne({
      event_id: eventId,
      user_id: userId,
      interest_type: 'favorite'
    });

    if (existing) {
      await collection.deleteOne({ _id: existing._id });
      return { is_favorited: false };
    } else {
      await collection.insertOne({
        event_id: eventId,
        user_id: userId,
        interest_type: 'favorite',
        created_at: new Date()
      });
      return { is_favorited: true };
    }
  } catch (error) {
    console.error('toggleEventFavoriteService error:', error);
    throw error;
  }
};

/**
 * Get user's favorite events
 */
export const getUserFavoriteEventsService = async (userId, { page = 1, limit = 10 } = {}) => {
  try {
    const skip = (page - 1) * limit;
    
    const favoriteEventIds = await mongoose.connection.db.collection('event_interests')
      .find({ user_id: userId, interest_type: 'favorite' })
      .project({ event_id: 1 })
      .toArray();
    
    const eventIds = favoriteEventIds.map(f => f.event_id);
    
    const total = eventIds.length;
    const events = await Event.find({ _id: { $in: eventIds } })
      .populate('club_id', 'name logo_url')
      .sort({ start_date: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      events,
      meta: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('getUserFavoriteEventsService error:', error);
    throw error;
  }
};

/**
 * Get event registrations (for management)
 */
export const getEventRegistrationsService = async (eventId, { page = 1, limit = 20, status } = {}) => {
  try {
    const skip = (page - 1) * limit;
    
    let query = { event_id: eventId };
    if (status) {
      query.status = status;
    }
    
    const total = await Registration.countDocuments(query);
    
    // Get user service URL for user details
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:3001';
    
    const registrations = await Registration.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Fetch user details for each registration
    const enrichedRegistrations = await Promise.all(
      registrations.map(async (reg) => {
        try {
          const userResponse = await axios.get(`${userServiceUrl}/api/users/${reg.user_id}`);
          const user = userResponse.data;
          
          return {
            ...reg,
            user_name: user.name || user.full_name,
            user_email: user.email,
            user_avatar: user.avatar_url || user.profile_picture
          };
        } catch (error) {
          console.warn(`Failed to fetch user details for ${reg.user_id}:`, error.message);
          return {
            ...reg,
            user_name: 'Unknown User',
            user_email: 'unknown@example.com',
            user_avatar: null
          };
        }
      })
    );

    return {
      registrations: enrichedRegistrations,
      meta: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('getEventRegistrationsService error:', error);
    throw error;
  }
};