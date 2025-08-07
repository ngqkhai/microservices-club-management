import { RSVPDTO, GetEventsDTO } from '../dtos/eventDto.js';
import { 
  getFilteredEvents, 
  rsvpToEvent, 
  joinEventService, 
  leaveEventService, 
  createEventService, 
  updateEventService, 
  deleteEventService, 
  getEventsOfClubService,
  getEventByIdService,
  getUserEventStatusService,
  toggleEventFavoriteService,
  getUserFavoriteEventsService,
  getEventRegistrationsService,
} from '../services/eventService.js';

export const getEvents = async (req, res) => {
  try {
    const dto = new GetEventsDTO(req.query);
    const result = await getFilteredEvents(dto);
    res.status(200).json(result);
  } catch (error) {
    console.error('getEvents error:', error);
    res.status(400).json({ 
      success: false,
      message: error.message,
      code: 'VALIDATION_ERROR'
    });
  }
};

export const handleEventRSVP = async (req, res) => {
  try {
    const event_id = req.params.id;
    const dto = new RSVPDTO({ ...req.body, event_id });
    const user_id = req.user.id; // Get user ID from API Gateway headers
    const result = await rsvpToEvent(dto.event_id, dto.status, user_id); 
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const joinEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id; // Get user ID from API Gateway headers
    
    console.log('joinEvent called:', { eventId, userId });
    
    const result = await joinEventService(eventId, userId);
    
    res.status(200).json({
      status: 'success',
      message: 'Joined event successfully',
      data: result
    });
  } catch (error) {
    console.error('joinEvent error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      eventId: req.params.id,
      userId: req.user?.id
    });

    // Handle specific error types
    if (error.message === 'Event not found') {
      return res.status(404).json({
        status: 404,
        error: 'EVENT_NOT_FOUND',
        message: 'Event not found'
      });
    }
    
    if (error.message === 'Service temporarily unavailable' || error.message === 'Database connection unavailable') {
      return res.status(503).json({
        status: 503,
        error: 'SERVICE_UNAVAILABLE',
        message: 'Service temporarily unavailable. Please try again later.'
      });
    }
    
    if (error.message === 'You already joined this event') {
      return res.status(400).json({
        status: 400,
        error: 'ALREADY_JOINED',
        message: 'You already joined this event'
      });
    }
    
    if (error.message === 'Event is full') {
      return res.status(400).json({
        status: 400,
        error: 'EVENT_FULL',
        message: 'Event has reached maximum capacity'
      });
    }

    if (error.message === 'Event is not available for joining') {
      return res.status(400).json({
        status: 400,
        error: 'EVENT_NOT_AVAILABLE',
        message: 'Event is not available for joining'
      });
    }

    // Handle MongoDB specific errors
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(404).json({
        status: 404,
        error: 'EVENT_NOT_FOUND',
        message: 'Event not found'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 400,
        error: 'VALIDATION_ERROR',
        message: 'Invalid data provided'
      });
    }
    
    // Generic error handling
    console.error('Unhandled error in joinEvent:', error);
    res.status(500).json({
      status: 500,
      error: 'INTERNAL_ERROR',
      message: 'An error occurred while joining the event'
    });
  }
};

export const leaveEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id; // Get user ID from API Gateway headers
    
    console.log('leaveEvent called:', { eventId, userId });
    
    const result = await leaveEventService(eventId, userId);
    
    res.status(200).json({
      status: 'success',
      message: 'Left event successfully',
      data: result
    });
  } catch (error) {
    console.error('leaveEvent error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      eventId: req.params.id,
      userId: req.user?.id
    });

    // Handle specific error types
    if (error.message === 'Event not found') {
      return res.status(404).json({
        status: 404,
        error: 'EVENT_NOT_FOUND',
        message: 'Event not found'
      });
    }
    
    if (error.message === 'Service temporarily unavailable' || error.message === 'Database connection unavailable') {
      return res.status(503).json({
        status: 503,
        error: 'SERVICE_UNAVAILABLE',
        message: 'Service temporarily unavailable. Please try again later.'
      });
    }
    
    if (error.message === 'You have not joined this event') {
      return res.status(400).json({
        status: 400,
        error: 'NOT_JOINED',
        message: 'You have not joined this event'
      });
    }

    // Handle MongoDB specific errors
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(404).json({
        status: 404,
        error: 'EVENT_NOT_FOUND',
        message: 'Event not found'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 400,
        error: 'VALIDATION_ERROR',
        message: 'Invalid data provided'
      });
    }
    
    // Generic error handling
    console.error('Unhandled error in leaveEvent:', error);
    res.status(500).json({
      status: 500,
      error: 'INTERNAL_ERROR',
      message: 'An error occurred while leaving the event'
    });
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const eventData = { ...req.body, created_by: req.user.id };
    const newEvent = await createEventService(eventData);
    res.status(201).json(newEvent);
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const eventData = req.body;
    const updatedEvent = await updateEventService(eventId, eventData);
    res.status(200).json(updatedEvent);
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    await deleteEventService(eventId);
    res.status(200).json({
      status: 'success',
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('deleteEvent error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      eventId: req.params.id,
      userId: req.user?.id
    });

    // Handle specific error types
    if (error.message === 'Event not found') {
      return res.status(404).json({
        status: 404,
        error: 'EVENT_NOT_FOUND',
        message: 'Event not found'
      });
    }
    
    if (error.message === 'Service temporarily unavailable' || error.message === 'Database connection unavailable') {
      return res.status(503).json({
        status: 503,
        error: 'SERVICE_UNAVAILABLE',
        message: 'Service temporarily unavailable. Please try again later.'
      });
    }

    // Handle MongoDB specific errors
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(404).json({
        status: 404,
        error: 'EVENT_NOT_FOUND',
        message: 'Event not found'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 400,
        error: 'VALIDATION_ERROR',
        message: 'Invalid data provided'
      });
    }
    
    // Generic error handling
    console.error('Unhandled error in deleteEvent:', error);
    res.status(500).json({
      status: 500,
      error: 'INTERNAL_ERROR',
      message: 'An error occurred while deleting the event'
    });
  }
};

export const getEventsOfClub = async (req, res, next) => {
  try {
    const clubId = req.params.id;
    const { status, start_from, start_to, page, limit } = req.query;
    const result = await getEventsOfClubService({
      clubId,
      status,
      start_from,
      start_to,
      page,
      limit
    });
    res.status(200).json(result);
  } catch (error) {
    if (error.name === 'CLUB_NOT_FOUND') {
      return res.status(404).json({
        status: 404,
        error: 'CLUB_NOT_FOUND',
        message: 'Club not found'
      });
    }
    next(error);
  }
};

/**
 * Get individual event by ID with user context
 */
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.headers['x-user-id']; // Optional user context
    const event = await getEventByIdService(id, userId);
    
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found',
        code: 'EVENT_NOT_FOUND'
      });
    }
    
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('getEventById error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Get user-specific event status (registration, favorite)
 */
export const getUserEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.headers['x-user-id'];
    const status = await getUserEventStatusService(id, userId);
    
    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('getUserEventStatus error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Toggle event favorite status for user
 */
export const toggleEventFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.headers['x-user-id'];
    const result = await toggleEventFavoriteService(id, userId);
    
    res.status(200).json({
      success: true,
      data: result,
      message: result.is_favorited ? 'Event added to favorites' : 'Event removed from favorites'
    });
  } catch (error) {
    console.error('toggleEventFavorite error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Get user's favorite events
 */
export const getUserFavoriteEvents = async (req, res) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'];
    const { page = 1, limit = 10 } = req.query;
    const result = await getUserFavoriteEventsService(userId, { page: parseInt(page), limit: parseInt(limit) });
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('getUserFavoriteEvents error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Get event registrations (for management)
 */
export const getEventRegistrations = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, status } = req.query;
    const result = await getEventRegistrationsService(id, { 
      page: parseInt(page), 
      limit: parseInt(limit),
      status 
    });
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('getEventRegistrations error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

