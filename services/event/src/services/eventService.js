import { getEventsFromMock } from '../repositories/eventRepository.js';
import { generateRSVPQRCode } from '../utils/logger.js';

export function getFilteredEvents({ filter, club_id }) {
  return getEventsFromMock({ filter, club_id });
}

export async function rsvpToEvent(event_id, status, user_id) {
  const result = await generateRSVPQRCode(event_id, status, user_id);
  return result;
}