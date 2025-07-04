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
    required: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['TODO', 'IN_PROGRESS', 'DONE'],
    required: true,
    default: 'TODO'
  },
  assignee_id: {
    type: String, // User ID reference to auth service
    index: true
  },
  due_date: {
    type: Date
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  },
  collection: 'event_tasks'
});

export const EventTask = mongoose.model('EventTask', eventTaskSchema);
