import { Event } from '../src/models/event.js';

export const mockEvents = [
  new Event({ id: 'e001', name: 'Hackathon 2025', start_time: '2025-07-01T10:00:00', club_id: 'c1' }),
  new Event({ id: 'e002', name: 'Tech Talk: Web3', start_time: '2025-06-20T15:00:00', club_id: 'c2' }),
  new Event({ id: 'e003', name: 'AI Seminar', start_time: '2025-06-15T09:00:00', club_id: 'c1' })
];