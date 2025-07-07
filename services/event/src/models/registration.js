import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const registrationSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true
  },
  user_id: {
    type: String, // User ID reference to auth service
    required: true,
    index: true
  },
  ticket_id: {
    type: String,
    unique: true,
    default: () => uuidv4()
  },
  payment_id: {
    type: String, // Reference to finance service transaction
    index: true
  },
  ticket_url: {
    type: String
  },
  qr_code_url: {
    type: String
  },
  status: {
    type: String,
    enum: ['REGISTERED', 'CANCELLED', 'ATTENDED'],
    required: true,
    default: 'REGISTERED'
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  },
  collection: 'registrations'
});

export const Registration = mongoose.model('Registration', registrationSchema);
