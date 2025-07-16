import { Event } from '../models/event.js';

export async function getEventsFromMock({ filter, club_id }) {
  const query = {};
  if (club_id) {
    query.club_id = club_id;
  }
  if (filter === 'upcoming') {
    query.start_date = { $gte: new Date() };
  }
  
  return await Event.find(query).sort({ start_date: 1 });
}

export async function findEventById(eventId) {
  return await Event.findById(eventId);
}

export async function updateEventInDB(eventId, eventData) {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $set: eventData },
      { new: true, runValidators: true }
    );
    return updatedEvent;
  } catch (error) {
    if (error.name === 'ValidationError') {
      const validationError = new Error(`Validation failed: ${error.message}`);
      validationError.status = 400;
      throw validationError;
    }
    throw error;
  }
}

export async function createEventInDB(eventData) {
  try {
    const newEvent = new Event(eventData);
    await newEvent.save();
    return newEvent;
  } catch (error) {
    // Re-throw with a more specific error message if it's a validation error
    if (error.name === 'ValidationError') {
      const validationError = new Error(`Validation failed: ${error.message}`);
      validationError.status = 400;
      throw validationError;
    }
    throw error;
  }
}

export async function deleteEventFromDB(eventId) {
  try {
    const deletedEvent = await Event.findByIdAndDelete(eventId);
    if (!deletedEvent) {
      const error = new Error('Event not found');
      error.status = 404;
      throw error;
    }
    return deletedEvent;
  } catch (error) {
    // Handle specific MongoDB errors
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      const castError = new Error('Event not found');
      castError.status = 404;
      throw castError;
    }
    throw error;
  }
}