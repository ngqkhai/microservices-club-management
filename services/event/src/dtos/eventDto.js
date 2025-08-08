import mongoose from 'mongoose';

export class GetEventsDTO {
  constructor(query) {
    const allowedFilters = ['upcoming', 'all', null];
    const allowedStatuses = ['draft', 'published', 'cancelled', 'completed'];

    const filter = query.filter?.toLowerCase() || 'all';
    const club_id = query.club_id?.trim();
    const status = query.status?.trim();
    const category = query.category?.trim();
    const location = query.location?.trim();
    const search = query.search?.trim();
    const start_from = query.start_from?.trim();
    const start_to = query.start_to?.trim();
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 10;

    // Validate filter
    if (!allowedFilters.includes(filter)) {
      throw new Error(`Invalid filter value: '${filter}'. Allowed values are: ${allowedFilters.join(', ')}`);
    }

    // Validate club_id
    if (club_id && !mongoose.Types.ObjectId.isValid(club_id)) {
      throw new Error(`'club_id' must be a valid ObjectId.`);
    }

    // Validate status
    if (status && !allowedStatuses.includes(status)) {
      throw new Error(`Invalid status value: '${status}'. Allowed values are: ${allowedStatuses.join(', ')}`);
    }

    // Do not rigidly validate categories here. Categories are dynamic and returned by DB.
    // Optionally, you could add lightweight validation (length/charset) if needed.

    // Validate pagination
    if (page < 1) {
      throw new Error('Page must be a positive integer.');
    }

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be a positive integer between 1 and 100.');
    }

    // Validate date range
    if (start_from && isNaN(Date.parse(start_from))) {
      throw new Error('start_from must be a valid date.');
    }

    if (start_to && isNaN(Date.parse(start_to))) {
      throw new Error('start_to must be a valid date.');
    }

    if (start_from && start_to && new Date(start_from) > new Date(start_to)) {
      throw new Error('start_from must be before start_to.');
    }

    this.filter = filter;
    this.club_id = club_id || null;
    this.status = status || null;
    this.category = category || null;
    this.location = location || null;
    this.search = search || null;
    this.start_from = start_from ? new Date(start_from) : null;
    this.start_to = start_to ? new Date(start_to) : null;
    this.page = page;
    this.limit = limit;
  }
}

export class RSVPDTO {
  constructor({ event_id, status }) {
    if (!event_id || typeof event_id !== 'string') {
      throw new Error('event_id không hợp lệ');
    }

    if (!status || !['confirmed', 'cancelled'].includes(status)) {
      throw new Error('status phải là confirmed hoặc cancelled');
    }

    this.event_id = event_id;
    this.status = status;
  }
}