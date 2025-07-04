import { getEventsFromMock } from '../repositories/eventRepository.js';
import { generateRSVPQRCode } from '../utils/logger.js';
import { Event } from '../models/event.js';
import { Participant } from '../models/participant.js';
import mongoose from 'mongoose';

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