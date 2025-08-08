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
    type: String, // UUID from Auth Service
    required: true,
    index: true
  },
  // Denormalized user info for fast access in registrations listing
  user_email: {
    type: String,
    trim: true,
    lowercase: true,
    maxLength: 254
  },
  user_name: {
    type: String,
    trim: true,
    maxLength: 200
  },
  ticket_id: {
    type: String,
    unique: true,
    maxLength: 50,
    default: () => uuidv4()
  },
  registration_data: {
    type: {
      answers: [{
        type: mongoose.Schema.Types.Mixed
      }],
      special_requirements: {
        type: String,
        maxLength: 1000
      },
      emergency_contact_legacy: {
        type: String,
        maxLength: 200
      }
    },
    default: {}
  },
  payment_info: {
    type: {
      amount: {
        type: Number,
        min: 0
      },
      currency: {
        type: String,
        maxLength: 3,
        default: 'USD'
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
      },
      transaction_id: {
        type: String,
        maxLength: 200
      },
      payment_method: {
        type: String,
        maxLength: 50
      }
    },
    default: {}
  },
  ticket_info: {
    type: {
      qr_code_url: {
        type: String,
        maxLength: 500
      },
      check_in_time: {
        type: Date
      }
    },
    default: {}
  },
  // Anti-replay for QR tickets (planned QR check-in)
  last_jti: {
    type: String,
    maxLength: 100
  },
  last_token_exp: {
    type: Date
  },
  status: {
    type: String,
    enum: ['registered', 'cancelled', 'attended', 'no_show'],
    required: true,
    default: 'registered' // Default status when registration is created
  },
  // Additional fields for registration management
  notes: {
    type: String,
    maxLength: 1000
  },
  updated_by: {
    type: String, // User ID who updated the registration status
    maxLength: 100
  },
  emergency_contact: {
    name: {
      type: String,
      maxLength: 100
    },
    phone: {
      type: String,
      maxLength: 20
    },
    relationship: {
      type: String,
      maxLength: 50
    }
  },
  registered_at: {
    type: Date,
    required: true,
    default: Date.now
  },
  cancelled_at: {
    type: Date
  },
  cancellation_reason: {
    type: String,
    maxLength: 500
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  },
  collection: 'event_registrations'
});

// Add indexes for better performance (matching schema requirements)
registrationSchema.index({ event_id: 1, user_id: 1 }, { unique: true });
registrationSchema.index({ event_id: 1, status: 1 });
registrationSchema.index({ user_id: 1, status: 1 });
registrationSchema.index({ registered_at: 1 });
// ticket_id already has unique: true in schema, no need for duplicate index

export const Registration = mongoose.model('Registration', registrationSchema);
