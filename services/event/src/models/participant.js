import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true
  },
  user_id: {
    type: String, // User ID reference to auth service
    required: true
  },
  joined_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'participants'
});

// Compound index for unique participation per user per event
participantSchema.index({ event_id: 1, user_id: 1 }, { unique: true });

export const Participant = mongoose.model('Participant', participantSchema);

// Keep the class for backward compatibility if needed
export class EventParticipant {
  constructor({ id, event_id, user_id, joined_at }) {
    this.id = id;
    this.event_id = event_id;
    this.user_id = user_id;
    this.joined_at = joined_at || new Date();
  }
}
