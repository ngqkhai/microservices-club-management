export class GetEventsDTO {
  constructor(query) {
    const allowedFilters = ['upcoming', 'all', null];

    const filter = query.filter?.toLowerCase() || 'all';
    const club_id = query.club_id?.trim();

    if (!allowedFilters.includes(filter)) {
      throw new Error(`Invalid filter value: '${filter}'. Allowed values are: ${allowedFilters.join(', ')}`);
    }

    if (club_id && typeof club_id !== 'string') {
      throw new Error(`'club_id' must be a string.`);
    }

    this.filter = filter;
    this.club_id = club_id || null;
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