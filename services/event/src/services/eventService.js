import { getEventsFromMock, createEventInDB, findEventById, updateEventInDB, deleteEventFromDB } from '../repositories/eventRepository.js';
import { generateRSVPQRCode } from '../utils/logger.js';
import { Event } from '../models/event.js';
import { Participant } from '../models/participant.js';
import mongoose from 'mongoose';
import axios from 'axios';

export function getFilteredEvents({ filter, club_id }) {
  return getEventsFromMock({ filter, club_id });
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
    if (event.status !== 'PUBLISHED') {
      throw new Error('Event is not available for joining');
    }

    // Check if user has already joined
    const existingParticipant = await Participant.findOne({
      event_id: eventId,
      user_id: userId
    });

    if (existingParticipant) {
      throw new Error('You already joined this event');
    }

    // Check if event has reached maximum capacity
    if (event.max_attendees) {
      const currentParticipants = await Participant.countDocuments({
        event_id: eventId
      });

      if (currentParticipants >= event.max_attendees) {
        throw new Error('Event is full');
      }
    }

    // Create new participant record
    const participant = new Participant({
      event_id: eventId,
      user_id: userId,
      joined_at: new Date()
    });

    await participant.save();

    return {
      eventId,
      userId,
      joinedAt: participant.joined_at,
      eventTitle: event.title,
      eventStartAt: event.start_at
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

    // Check if user has joined the event
    const existingParticipant = await Participant.findOne({
      event_id: eventId,
      user_id: userId
    });

    if (!existingParticipant) {
      throw new Error('You have not joined this event');
    }

    // Remove participant record
    await Participant.deleteOne({
      event_id: eventId,
      user_id: userId
    });

    return {
      eventId,
      userId,
      leftAt: new Date(),
      eventTitle: event.title,
      eventStartAt: event.start_at
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
  let { title, description, location, start_at, end_at, max_attendees, fee, status, created_by, club_id } = eventData;

  // 3.1: Validate required fields
  if (!title || !description || !location || !start_at || !end_at || !max_attendees) {
    const error = new Error('Missing required fields: title, description, location, start_at, end_at, and max_attendees are required.');
    error.status = 400;
    throw error;
  }

  // 3.2: Validate rules
  if (new Date(start_at) <= new Date()) {
    const error = new Error('Event start_at must be a future date.');
    error.status = 400;
    throw error;
  }

  if (new Date(end_at) <= new Date(start_at)) {
    const error = new Error('Event end_at must be after start_at.');
    error.status = 400;
    throw error;
  }

  if (!Number.isInteger(max_attendees) || max_attendees <= 0) {
    const error = new Error('max_attendees must be a positive integer.');
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
    location,
    start_at,
    end_at,
    max_attendees,
    fee: fee || 0,
    status: status || 'DRAFT',
    created_by,
    club_id
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
  if (eventData.club_id && eventData.club_id !== existingEvent.club_id) {
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

  // 5.2: Check if event has participants - optionally prevent deletion if there are participants
  const participantCount = await Participant.countDocuments({ event_id: eventId });
  if (participantCount > 0) {
    // Optional: You can either prevent deletion or allow it with cascade deletion
    // For now, let's allow deletion but clean up related data
    console.log(`Deleting event with ${participantCount} participants. Related data will be cleaned up.`);
    
    // Clean up related participant records
    await Participant.deleteMany({ event_id: eventId });
    
    // Clean up related registration records if they exist
    const Registration = (await import('../models/registration.js')).Registration;
    await Registration.deleteMany({ event_id: eventId });
  }

  // 5.3: Delete the event from the repository
  await deleteEventFromDB(eventId);
  
  return { message: 'Event and related data deleted successfully' };
};

export const getEventsOfClubService = async ({ clubId, status, start_from, start_to, page = 1, limit = 10 }) => {
  // 1. Validate club exists (call Club Service)
  const clubServiceUrl = process.env.CLUB_SERVICE_URL || 'http://club-service:3002';
  try {
    await axios.get(`${clubServiceUrl}/api/clubs/${clubId}`);
  } catch (err) {
    const error = new Error('Club not found');
    error.name = 'CLUB_NOT_FOUND';
    throw error;
  }

  // 2. Build query
  const query = { club_id: clubId };
  if (status === 'upcoming') {
    query.start_at = { $gte: new Date() };
  }
  if (start_from || start_to) {
    query.start_at = query.start_at || {};
    if (start_from) query.start_at.$gte = new Date(start_from);
    if (start_to) query.start_at.$lte = new Date(start_to);
  }

  // 3. Pagination
  const pageNumber = parseInt(page, 10) || 1;
  const pageSize = parseInt(limit, 10) || 10;
  const skip = (pageNumber - 1) * pageSize;

  // 4. Query DB
  const total = await Event.countDocuments(query);
  const events = await Event.find(query)
    .sort({ start_at: 1 })
    .skip(skip)
    .limit(pageSize);

  // 5. Format results
  return {
    total,
    results: events.map(e => ({
      id: e._id,
      title: e.title,
      start_at: e.start_at,
      status: (e.start_at > new Date()) ? 'upcoming' : e.status
    }))
  };
};