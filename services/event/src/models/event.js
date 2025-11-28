import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  club_id: {
    type: mongoose.Schema.Types.ObjectId, // References Club Service clubs
    required: true,
    index: true
  },
  club: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    name: {
      type: String,
      maxLength: 200,
      required: false
    },
    logo_url: {
      type: String,
      maxLength: 500,
      required: false,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Club logo URL must be a valid HTTP/HTTPS URL'
      }
    }
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
    enum: ['Workshop', 'Seminar', 'Competition', 'Social', 'Fundraiser', 'Meeting', 'Other'],
    default: 'Other'
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
  event_image_url: {
    type: String,
    maxLength: 500,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Event image URL must be a valid HTTP/HTTPS URL'
    }
  },
  event_logo_url: {
    type: String,
    maxLength: 500,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Event logo URL must be a valid HTTP/HTTPS URL'
    }
  },
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
  // Event agenda/schedule
  agenda: [{
    time: {
      type: String,
      maxLength: 20
    },
    activity: {
      type: String,
      maxLength: 300
    }
  }],
  // Additional resources
  resources: [{
    name: {
      type: String,
      maxLength: 200
    },
    type: {
      type: String,
      maxLength: 50
    },
    url: {
      type: String,
      maxLength: 500
    },
    size: {
      type: String,
      maxLength: 20
    }
  }],
  // Contact information
  contact_info: {
    email: {
      type: String,
      maxLength: 100
    },
    phone: {
      type: String,
      maxLength: 20
    },
    website: {
      type: String,
      maxLength: 200
    }
  },
  // Social media links
  social_links: {
    facebook: {
      type: String,
      maxLength: 200
    },
    instagram: {
      type: String,
      maxLength: 200
    },
    discord: {
      type: String,
      maxLength: 200
    }
  },
  // Detailed location info
  detailed_location: {
    type: String,
    maxLength: 500
  },
  venue_capacity: {
    type: Number,
    min: 1
  },
  // Current participants count (computed field)
  current_participants: {
    type: Number,
    default: 0,
    min: 0
  },
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
    user_full_name: {
      type: String,
      maxLength: 200,
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