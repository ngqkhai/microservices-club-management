import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  club_id: {
    type: String, // References Club Service clubs
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
    maxLength: 2000
  },
  short_description: {
    type: String,
    maxLength: 500
  },
  category: {
    type: String,
    enum: ['workshop', 'seminar', 'competition', 'social', 'fundraiser', 'meeting', 'other'],
    default: 'other'
  },
  location: {
    location_type: {
      type: String,
      enum: ['physical', 'virtual', 'hybrid'],
      default: 'physical'
    },
    address: {
      type: String,
      maxLength: 500
    },
    room: {
      type: String,
      maxLength: 100
    },
    virtual_link: {
      type: String,
      maxLength: 500
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  start_date: {
    type: Date,
    required: true,
    index: true
  },
  end_date: {
    type: Date,
    required: true
  },
  registration_deadline: {
    type: Date
  },
  max_participants: {
    type: Number,
    min: 1
  },
  participation_fee: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    maxLength: 3,
    default: 'USD'
  },
  requirements: [{
    type: String
  }],
  tags: [{
    type: String
  }],
  images: [{
    type: String
  }],
  attachments: [{
    filename: {
      type: String,
      maxLength: 200
    },
    url: {
      type: String,
      maxLength: 500
    },
    size: {
      type: Number
    },
    type: {
      type: String,
      maxLength: 50
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    required: true,
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'club_members'],
    default: 'club_members'
  },
  organizers: [{
    user_id: {
      type: String, // UUID from Auth Service
      required: true
    },
    role: {
      type: String,
      enum: ['organizer', 'lead_organizer'],
      default: 'organizer'
    },
    joined_at: {
      type: Date,
      default: Date.now
    }
  }],
  statistics: {
    type: {
      total_registrations: {
        type: Number,
        min: 0,
        default: 0
      },
      total_interested: {
        type: Number,
        min: 0,
        default: 0
      },
      total_attended: {
        type: Number,
        min: 0,
        default: 0
      }
    },
    default: {
      total_registrations: 0,
      total_interested: 0,
      total_attended: 0
    }
  },
  created_by: {
    type: String, // UUID from Auth Service
    required: true
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  },
  collection: 'events'
});

// Add indexes for better performance (matching schema requirements)
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ club_id: 1, status: 1 });
eventSchema.index({ start_date: 1, end_date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ visibility: 1 });
eventSchema.index({ created_by: 1 });
eventSchema.index({ registration_deadline: 1 });

export const Event = mongoose.model('Event', eventSchema);