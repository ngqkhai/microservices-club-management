import { RSVPDTO, GetEventsDTO } from '../dtos/eventDto.js';
import { getFilteredEvents, rsvpToEvent } from '../services/eventService.js';

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
    const user_id = 'u123'; // giả lập
    const result = await rsvpToEvent(dto.event_id, dto.status, user_id); 
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};