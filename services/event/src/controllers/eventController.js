import { RSVPDTO, GetEventsDTO } from '../dtos/eventDto.js';
import { getFilteredEvents, rsvpToEvent, joinEventService } from '../services/eventService.js';

export const getEvents = (req, res) => {
  try {
    const dto = new GetEventsDTO(req.query);
    const events = getFilteredEvents(dto);
    res.status(200).json(events);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const handleEventRSVP = async (req, res) => {
  try {
    const event_id = req.params.event_id;
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