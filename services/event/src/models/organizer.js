import mongoose from 'mongoose';

const organizerSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user_id: {
    type: String, // User ID reference to auth service
    required: true
  }
}, {
  collection: 'organizers'
});

// Compound index for unique organizer per event
organizerSchema.index({ event_id: 1, user_id: 1 }, { unique: true });

export const Organizer = mongoose.model('Organizer', organizerSchema);
