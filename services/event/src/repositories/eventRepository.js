import { Event } from '../models/event.js';

export async function getEventsFromMock({ filter, club_id, status, category, location, search, start_from, start_to, page = 1, limit = 10 }) {
  // Build the query
  const query = {};
  const now = new Date();
  
  // Club filter
  if (club_id) {
    query.club_id = club_id;
  }
  
  // Status filter
  if (status) {
    query.status = status;
  }
  
  // Category filter
  if (category) {
    query.category = category;
  }
  
  // Location filter (case-insensitive partial match)
  if (location) {
    query.$or = query.$or || [];
    query.$or.push({
      $or: [
        { 'location.address': { $regex: location, $options: 'i' } },
        { 'location.room': { $regex: location, $options: 'i' } },
        { detailed_location: { $regex: location, $options: 'i' } }
      ]
    });
  }
  
  // Search filter (across multiple fields)
  if (search) {
    const searchRegex = { $regex: search, $options: 'i' };
    const searchConditions = [
      { title: searchRegex },
      { description: searchRegex },
      { short_description: searchRegex },
      { tags: { $in: [searchRegex] } },
      { 'location.address': searchRegex },
      { detailed_location: searchRegex }
    ];
    
    if (query.$or) {
      // If location filter already added $or, combine with $and
      query.$and = [
        { $or: query.$or },
        { $or: searchConditions }
      ];
      delete query.$or;
    } else {
      query.$or = searchConditions;
    }
  }
  
  // Date range filters
  const dateConditions = [];
  
  // Filter by date range
  if (start_from || start_to) {
    const dateRange = {};
    if (start_from) {
      dateRange.$gte = start_from;
    }
    if (start_to) {
      dateRange.$lte = start_to;
    }
    dateConditions.push({ start_date: dateRange });
  }
  
  // Filter by upcoming events
  if (filter === 'upcoming') {
    dateConditions.push({ start_date: { $gte: now } });
  }
  
  // Combine date conditions with existing query
  if (dateConditions.length > 0) {
    if (query.$and) {
      query.$and = [...query.$and, ...dateConditions];
    } else if (query.$or) {
      query.$and = [{ $or: query.$or }, ...dateConditions];
      delete query.$or;
    } else {
      query.$and = dateConditions;
    }
  }
  
  // Pagination
  const skip = (page - 1) * limit;
  
  // Get total count for pagination
  const total = await Event.countDocuments(query);
  
  // Get events with pagination
  const events = await Event.find(query)
    .sort({ start_date: 1, created_at: -1 })
    .skip(skip)
    .limit(limit)
    .populate('club_id', 'name logo_url description')
    .lean();
  
  return {
    events,
    meta: {
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
      has_next: page < Math.ceil(total / limit),
      has_previous: page > 1
    }
  };
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