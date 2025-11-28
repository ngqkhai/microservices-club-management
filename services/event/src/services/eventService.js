import { getEventsFromMock, createEventInDB, findEventById, updateEventInDB, deleteEventFromDB } from '../repositories/eventRepository.js';
import { generateRSVPQRCode } from '../utils/qrCodeGenerator.js';

import { Registration } from '../models/registration.js';
import mongoose from 'mongoose';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { Event } from '../models/event.js';
import logger from '../utils/logger.js';

export async function getFilteredEvents(dto) {
  const result = await getEventsFromMock({
    filter: dto.filter,
    club_id: dto.club_id,
    // Use the status from DTO (allows 'completed' for recent events)
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
    images: event.images || [],
    event_image_url: event.event_image_url,
    event_logo_url: event.event_logo_url,
    status: event.status,
    visibility: event.visibility,
    club_id: event.club_id,
    club: event.club && event.club.id ? {
      id: event.club.id,
      name: event.club.name,
      logo_url: event.club.logo_url
    } : (event.club_id ? {
      id: event.club_id._id || event.club_id.id,
      name: event.club_id.name,
      logo_url: event.club_id.logo_url,
      description: event.club_id.description
    } : null),
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

export async function joinEventService(eventId, userContext) {
  // Extract user info early so it's available in catch block
  const userId = userContext?.userId || (typeof userContext === 'string' ? userContext : undefined);
  const userEmail = userContext?.userEmail;
  const userFullName = userContext?.userFullName;

  try {
    logger.debug('joinEventService called', { eventId, userId });

    // Validate eventId format (MongoDB ObjectId)
    if (!eventId || !eventId.match(/^[0-9a-fA-F]{24}$/)) {
      logger.debug('Invalid eventId format', { eventId });
      throw new Error('Event not found');
    }

    // Check database connection
    if (!mongoose.connection.readyState) {
      logger.error('Database not connected');
      throw new Error('Database connection unavailable');
    }

    logger.debug('Searching for event', { eventId });

    // Check if event exists
    const event = await Event.findById(eventId);
    logger.debug('Event lookup result', { eventId, found: !!event });

    if (!event) {
      throw new Error('Event not found');
    }

    // Check if event is available for joining
    const now = new Date();
    const allowedStatuses = ['published', 'ongoing'];
    if (!allowedStatuses.includes(event.status)) {
      throw new Error('Event is not available for joining');
    }
    if (event.registration_deadline && new Date(event.registration_deadline) < now) {
      throw new Error('Registration deadline has passed');
    }

    // Check if user has already registered (any status)
    const existingRegistration = await Registration.findOne({
      event_id: eventId,
      user_id: userId,
    });

    if (existingRegistration && ['registered', 'attended'].includes(existingRegistration.status)) {
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

    // Upsert registration to avoid duplicate key if a cancelled record exists
    const registeredAt = new Date();
    const registration = await Registration.findOneAndUpdate(
      { event_id: eventId, user_id: userId },
      {
        $set: {
      status: 'registered',
          registered_at: registeredAt,
          user_email: userEmail,
          user_name: userFullName,
        },
        $unset: { cancelled_at: '', cancellation_reason: '' }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return {
      eventId,
      userId,
      joinedAt: registration.registered_at || registeredAt,
      eventTitle: event.title,
      eventStartAt: event.start_date
    };
  } catch (error) {
    // Log the actual error for debugging
    logger.error('joinEventService error', {
      message: error.message,
      name: error.name,
      eventId,
      userId,
      dbState: mongoose.connection.readyState
    });

    // Handle duplicate key by treating as already existing registration
    if (error && (error.code === 11000 || (typeof error.message === 'string' && error.message.includes('E11000')))) {
      const registeredAt = new Date();
      const registration = await Registration.findOneAndUpdate(
        { event_id: eventId, user_id: userId },
        {
          $set: {
            status: 'registered',
            registered_at: registeredAt,
            user_email: userEmail,
            user_name: userFullName,
          },
          $unset: { cancelled_at: '', cancellation_reason: '' }
        },
        { new: true }
      );
      return {
        eventId,
        userId,
        joinedAt: registration?.registered_at || registeredAt,
        eventTitle: (await Event.findById(eventId))?.title,
        eventStartAt: (await Event.findById(eventId))?.start_date,
      };
    }

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
    logger.debug('leaveEventService called', { eventId, userId });

    // Validate eventId format (MongoDB ObjectId)
    if (!eventId || !eventId.match(/^[0-9a-fA-F]{24}$/)) {
      logger.debug('Invalid eventId format', { eventId });
      throw new Error('Event not found');
    }

    // Check database connection
    if (!mongoose.connection.readyState) {
      logger.error('Database not connected');
      throw new Error('Database connection unavailable');
    }

    logger.debug('Searching for event', { eventId });

    // Check if event exists
    const event = await Event.findById(eventId);
    logger.debug('Event lookup result', { eventId, found: !!event });

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
    logger.error('leaveEventService error', {
      message: error.message,
      name: error.name,
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

/**
 * Issue a short-lived QR ticket for a user's active registration
 */
export const issueEventTicketService = async (eventId, userId) => {
  // Validate registration exists and is active
  const registration = await Registration.findOne({ event_id: eventId, user_id: userId, status: 'registered' });
  if (!registration) {
    const err = new Error('No active registration for this event');
    err.status = 400;
    throw err;
  }

  // Sign a short-lived JWT as QR token
  const ttlSeconds = 90; // 1.5 minutes
  const nowSeconds = Math.floor(Date.now() / 1000);
  const jti = `${registration._id}:${Date.now()}`;
  const payload = {
    typ: 'event_ticket',
    evt: String(eventId),
    reg: String(registration._id),
    uid: String(userId),
    iat: nowSeconds,
    exp: nowSeconds + ttlSeconds,
    jti
  };
  const secret = process.env.EVENT_QR_JWT_PRIVATE || process.env.JWT_SECRET || 'dev-secret';
  const token = jwt.sign(payload, secret, { algorithm: 'HS256' });

  // Persist anti-replay markers
  registration.last_jti = jti;
  registration.last_token_exp = new Date((nowSeconds + ttlSeconds) * 1000);
  await registration.save();

  return { qr_token: token, expires_at: registration.last_token_exp };
};

/**
 * Verify QR token and mark registration attended
 */
export const checkInWithTicketService = async (eventId, qrToken, checkerUserId) => {
  if (!qrToken) {
    const err = new Error('qr_token is required');
    err.status = 400;
    throw err;
  }
  const secret = process.env.EVENT_QR_JWT_PRIVATE || process.env.JWT_SECRET || 'dev-secret';
  let decoded;
  try {
    decoded = jwt.verify(qrToken, secret);
  } catch (e) {
    const err = new Error('Invalid or expired QR token');
    err.status = 400;
    throw err;
  }
  if (decoded.typ !== 'event_ticket' || String(decoded.evt) !== String(eventId)) {
    const err = new Error('QR token does not match this event');
    err.status = 400;
    throw err;
  }

  const registration = await Registration.findById(decoded.reg);
  if (!registration || String(registration.event_id) !== String(eventId) || String(registration.user_id) !== String(decoded.uid)) {
    const err = new Error('Registration not found for token');
    err.status = 404;
    throw err;
  }

  // Anti-replay: require latest jti
  if (!registration.last_jti || registration.last_jti !== decoded.jti) {
    const err = new Error('QR token has been superseded');
    err.status = 400;
    throw err;
  }

  // Must be currently registered to check-in
  if (registration.status !== 'registered') {
    const err = new Error('Registration is not in a check-in eligible state');
    err.status = 400;
    throw err;
  }

  // Mark attended
  registration.status = 'attended';
  registration.ticket_info = registration.ticket_info || {};
  registration.ticket_info.check_in_time = new Date();
  registration.updated_by = checkerUserId;
  await registration.save();

  return { registration_id: String(registration._id), status: registration.status, check_in_time: registration.ticket_info.check_in_time };
};

export const createEventService = async (eventData) => {
  const {
    title,
    description,
    short_description,
    category,
    location,
    start_date,
    end_date,
    start_time,
    end_time,
    agenda,
    registration_deadline,
    max_participants,
    participation_fee,
    currency,
    requirements,
    tags,
    images,
    event_image_url,
    event_logo_url,
    attachments,
    contact_info,
    social_links,
    status,
    visibility,
    organizers,
    created_by,
    club_id: providedClubId,
    club,
    club_name,
    club_logo_url,
    // Backward compatibility
    start_at,
    end_at,
    max_attendees,
    fee
  } = eventData;

  // Use provided club_id or will be resolved later
  let club_id = providedClubId;

  // Handle field mapping for backward compatibility and combine date/time if provided
  const startDate = start_date || start_at;
  const endDate = end_date || end_at;

  // Combine date and time if both are provided
  const startDateTime = start_time ? `${startDate}T${start_time}:00` : startDate;
  const endDateTime = end_time ? `${endDate}T${end_time}:00` : endDate;
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

  // Allow same-day events by checking if end date/time is before start date/time
  if (new Date(endDateTime) < new Date(startDateTime)) {
    const error = new Error('Event end date/time must be after start date/time.');
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
    start_date: startDateTime,
    end_date: endDateTime,
    agenda: agenda || [],
    registration_deadline,
    max_participants: maxCapacity,
    participation_fee: eventFee || 0,
    currency: currency || 'USD',
    requirements: requirements || [],
    tags: tags || [],
    images: images || [],
    event_image_url,
    event_logo_url,
    attachments: attachments || [],
    contact_info: contact_info || {},
    social_links: social_links || {},
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
    club: {
      id: club_id ? new mongoose.Types.ObjectId(club_id) : null,
      name: club_name || (club && club.club_name) || null,
      logo_url: club_logo_url || (club && club.club_logo_url) || null
    },
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
    logger.info('Deleting event with active registrations', { eventId, registrationCount });

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

    const query = { club_id: new mongoose.Types.ObjectId(clubId), status: 'published' };
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
    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
        .sort({ start_date: 1 })
        .skip(skip)
        .limit(pageSize)
        .lean();

    // 3.1: Tính toán số người tham gia từ registrations (registered + attended) và attended
    const eventIds = events.map(e => e._id);
    let countsByEventId = new Map();
    if (eventIds.length > 0) {
        const pipeline = [
            { $match: { event_id: { $in: eventIds } } },
            { $group: {
                _id: '$event_id',
                participants_count: {
                    $sum: { $cond: [{ $in: ['$status', ['registered', 'attended']] }, 1, 0] }
                },
                attended_count: {
                    $sum: { $cond: [{ $eq: ['$status', 'attended'] }, 1, 0] }
                }
            } }
        ];
        const agg = await Registration.aggregate(pipeline);
        countsByEventId = new Map(agg.map(r => [String(r._id), { participants_count: r.participants_count || 0, attended_count: r.attended_count || 0 }]));
    }

    // 4. Định dạng kết quả
    const getEventStatus = (event) => {
        // Ưu tiên trạng thái đã được lưu trong DB
        if (event.status) {return event.status;}

        const now = new Date();
        // Đảm bảo các ngày là đối tượng Date hợp lệ
        const startDate = event.start_date ? new Date(event.start_date) : null;
        const endDate = event.end_date ? new Date(event.end_date) : null;

        if (endDate && endDate < now) {return 'past';}
        if (startDate && startDate > now) {return 'upcoming';}
        if (startDate && endDate && startDate <= now && endDate >= now) {return 'ongoing';}

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
            // Image fields
            images: e.images || [],
            event_image_url: e.event_image_url,
            event_logo_url: e.event_logo_url,
            statistics: e.statistics ?? {
                total_registrations: 0,
                total_interested: 0,
                total_attended: 0
            },
            participants_count: (countsByEventId.get(String(e._id))?.participants_count) ?? 0,
            attended_count: (countsByEventId.get(String(e._id))?.attended_count) ?? 0,
            current_participants: (countsByEventId.get(String(e._id))?.participants_count) ?? 0 // backward compat
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
 * Get distinct event categories
 */
export const getDistinctEventCategoriesService = async () => {
  // Distinct categories from events collection
  const categories = await Event.distinct('category');
  // Filter falsy and normalize to unique non-empty strings
  return (categories || []).filter(Boolean);
};

/**
 * Get distinct event locations (addresses and rooms)
 */
export const getDistinctEventLocationsService = async () => {
  // Aggregate distinct address/room values present in events
  const results = await Event.aggregate([
    {
      $project: {
        address: '$location.address',
        room: '$location.room',
        platform: '$location.platform',
        detailed_location: '$detailed_location'
      }
    },
    {
      $project: {
        values: {
          $setUnion: [
            { $cond: [{ $ifNull: ['$address', false] }, ['$address'], []] },
            { $cond: [{ $ifNull: ['$room', false] }, ['$room'], []] },
            { $cond: [{ $ifNull: ['$platform', false] }, ['$platform'], []] },
            { $cond: [{ $ifNull: ['$detailed_location', false] }, ['$detailed_location'], []] }
          ]
        }
      }
    },
    { $unwind: '$values' },
    { $group: { _id: null, items: { $addToSet: '$values' } } },
    { $project: { _id: 0, items: 1 } }
  ]);
  const items = results?.[0]?.items || [];
  return items.filter(Boolean);
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

    // Calculate participants from registrations
    const [participantsAgg] = await Registration.aggregate([
      { $match: { event_id: new mongoose.Types.ObjectId(eventId) } },
      { $group: {
          _id: '$event_id',
          participants_count: { $sum: { $cond: [{ $in: ['$status', ['registered', 'attended']] }, 1, 0] } },
          attended_count: { $sum: { $cond: [{ $eq: ['$status', 'attended'] }, 1, 0] } }
      } }
    ]);
    const participants_count = participantsAgg?.participants_count || 0;
    const attended_count = participantsAgg?.attended_count || 0;

    // Format club information - use embedded club data first, fallback to populated club_id
    const clubInfo = event.club && event.club.id ? {
      id: event.club.id,
      name: event.club.name,
      logo_url: event.club.logo_url
    } : (event.club_id ? {
      id: event.club_id._id || event.club_id.id || event.club_id,
      name: event.club_id.name || null,
      logo_url: event.club_id.logo_url || null
    } : null);

    return {
      ...event,
      participants_count,
      attended_count,
      current_participants: participants_count, // backward compat
      club: clubInfo,
      user_status: userStatus
    };
  } catch (error) {
    logger.error('getEventByIdService error', { eventId, error: error.message });
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
    logger.error('getUserEventStatusService error', { eventId, userId, error: error.message });
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
    logger.error('toggleEventFavoriteService error', { eventId, userId, error: error.message });
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
    logger.error('getUserFavoriteEventsService error', { userId, error: error.message });
    throw error;
  }
};

/**
 * Get event registrations (for management)
 */
export const getEventRegistrationsService = async (eventId, { page = 1, limit = 20, status } = {}) => {
  try {
    const skip = (page - 1) * limit;

    const query = { event_id: eventId };
    if (status) {
      query.status = status;
    }

    const total = await Registration.countDocuments(query);

    const registrations = await Registration.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Use embedded fields; avoid external user-service dependency
    const enrichedRegistrations = registrations.map((reg) => ({
            ...reg,
      user_name: reg.user_name || 'Unknown User',
      user_email: reg.user_email || 'unknown@example.com',
      user_avatar: reg.user_avatar || null,
    }));

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
    logger.error('getEventRegistrationsService error', { eventId, error: error.message });
    throw error;
  }
};

/**
 * Update event registration status
 */
export const updateEventRegistrationStatusService = async (eventId, registrationId, status) => {
  try {
    const allowed = ['registered', 'attended', 'cancelled'];
    if (!allowed.includes(status)) {
      const err = new Error('Invalid status');
      err.status = 400;
      throw err;
    }

    const updated = await Registration.findOneAndUpdate(
      { _id: registrationId, event_id: eventId },
      { status },
      { new: true }
    ).lean();

    if (!updated) {
      const err = new Error('Registration not found');
      err.status = 404;
      throw err;
    }

    return updated;
  } catch (error) {
    logger.error('updateEventRegistrationStatusService error', { eventId, registrationId, error: error.message });
    throw error;
  }
};

/**
 * Get events of a user (by registrations)
 */
export const getMyEventsService = async (userId) => {
  try {
    const regs = await Registration.find({ user_id: userId }).select('event_id').lean();
    const eventIds = [...new Set(regs.map((r) => r.event_id).filter(Boolean))];
    if (eventIds.length === 0) {return [];}
    const events = await Event.find({ _id: { $in: eventIds } }).lean();
    return events;
  } catch (error) {
    logger.error('getMyEventsService error', { userId, error: error.message });
    throw error;
  }
};