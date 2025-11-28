import mongoose from 'mongoose';

const eventTaskSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxLength: 200
  },
  description: {
    type: String,
    maxLength: 1000
  },
  assigned_to: {
    type: String, // UUID from Auth Service
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    required: true,
    default: 'pending'
  },
  due_date: {
    type: Date
  },
  completed_at: {
    type: Date
  },
  notes: {
    type: String,
    maxLength: 1000
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  collection: 'event_tasks'
});

// Add indexes for better performance (matching schema requirements)
eventTaskSchema.index({ event_id: 1 });
eventTaskSchema.index({ assigned_to: 1 });
eventTaskSchema.index({ status: 1 });
eventTaskSchema.index({ due_date: 1 });

export const EventTask = mongoose.model('EventTask', eventTaskSchema);
