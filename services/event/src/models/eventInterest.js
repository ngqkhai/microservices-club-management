import mongoose from 'mongoose';

const eventInterestSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true
  },
  user_id: {
    type: String, // UUID from Auth Service
    required: true
  },
  notifications_enabled: {
    type: Boolean,
    default: true
  },
  marked_at: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  collection: 'event_interests'
});

// Add indexes for better performance (matching schema requirements)
eventInterestSchema.index({ event_id: 1, user_id: 1 }, { unique: true });
eventInterestSchema.index({ user_id: 1 });
eventInterestSchema.index({ marked_at: 1 });

export const EventInterest = mongoose.model('EventInterest', eventInterestSchema);
