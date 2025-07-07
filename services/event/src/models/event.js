import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  club_id: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  location: {
    type: String
  },
  start_at: {
    type: Date,
    required: true,
    index: true
  },
  end_at: {
    type: Date,
    required: true
  },
  fee: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'CANCELLED'],
    required: true,
    default: 'DRAFT'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  max_attendees: {
    type: Number,
    min: 1
  },
  image_url: {
    type: String
  },
  created_by: {
    type: String // User ID reference
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  },
  collection: 'events'
});

export const Event = mongoose.model('Event', eventSchema);