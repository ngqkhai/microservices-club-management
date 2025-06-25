import { mockEvents } from '../../shared/MockDataEvent.js';

export function getEventsFromMock({ filter, club_id }) {
  let events = mockEvents;
  if (club_id) {
    events = events.filter(e => e.club_id === club_id);
  }

  if (filter === 'upcoming') {
    const now = new Date();
    events = events.filter(e => new Date(e.start_time) >= now);
  }

  return events;
}