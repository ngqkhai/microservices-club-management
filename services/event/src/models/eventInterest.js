import mongoose from 'mongoose';

const eventInterestSchema = new mongoose.Schema({
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
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'event_interests'
});

// Compound index for unique interest per user per event
eventInterestSchema.index({ event_id: 1, user_id: 1 }, { unique: true });

export const EventInterest = mongoose.model('EventInterest', eventInterestSchema);
