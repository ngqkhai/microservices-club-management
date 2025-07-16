const mongoose = require('mongoose');

// Define schemas outside the connection function
// Define Club schema based on the updated schema requirements
const clubSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    maxLength: 200 
  },
  description: { 
    type: String,
    maxLength: 2000 
  },
  category: {
    type: String,
    required: true,
    enum: ['academic', 'sports', 'arts', 'technology', 'social', 'volunteer', 'cultural', 'other']
  },
  location: {
    type: String,
    maxLength: 500
  },
  contact_email: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  contact_phone: {
    type: String,
    maxLength: 20
  },
  logo_url: { 
    type: String,
    maxLength: 500,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Logo URL must be a valid HTTP/HTTPS URL'
    }
  },
  website_url: { 
    type: String,
    maxLength: 500,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Website URL must be a valid HTTP/HTTPS URL'
    }
  },
  social_links: {
    type: {
      facebook: { 
        type: String, 
        maxLength: 500,
        validate: {
          validator: function(v) {
            return !v || /^https?:\/\/.+/.test(v);
          },
          message: 'Facebook URL must be a valid HTTP/HTTPS URL'
        }
      },
      instagram: { 
        type: String, 
        maxLength: 500,
        validate: {
          validator: function(v) {
            return !v || /^https?:\/\/.+/.test(v);
          },
          message: 'Instagram URL must be a valid HTTP/HTTPS URL'
        }
      },
      twitter: { 
        type: String, 
        maxLength: 500,
        validate: {
          validator: function(v) {
            return !v || /^https?:\/\/.+/.test(v);
          },
          message: 'Twitter URL must be a valid HTTP/HTTPS URL'
        }
      },
      linkedin: { 
        type: String, 
        maxLength: 500,
        validate: {
          validator: function(v) {
            return !v || /^https?:\/\/.+/.test(v);
          },
          message: 'LinkedIn URL must be a valid HTTP/HTTPS URL'
        }
      }
    },
    default: {}
  },
  settings: {
    type: {
      is_public: { type: Boolean, default: true },
      requires_approval: { type: Boolean, default: true },
      max_members: { type: Number, min: 1 }
    },
    default: {
      is_public: true,
      requires_approval: true
    }
  },
  // Deprecated fields (keeping for backward compatibility)
  type: { type: String }, // Will be migrated to category
  size: { type: Number }, // Will use membership count instead
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { 
    type: String, 
    default: 'ACTIVE',
    enum: ['ACTIVE', 'INACTIVE'] 
  },
  created_by: { 
    type: String, 
    required: true
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date }
});

// Text index on club name for search functionality
clubSchema.index({ name: 'text' });

// Define Membership schema (enhanced to match schema requirements)
const membershipSchema = new mongoose.Schema({
  club_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'Club' 
  },
  user_id: { 
    type: String, 
    required: true 
  },
  campaign_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecruitmentCampaign',
    default: null
  },
  role: { 
    type: String, 
    required: true,
    enum: ['member', 'organizer', 'admin'],
    default: 'member'
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'pending', 'rejected', 'removed'],
    default: 'pending'
  },
  application_message: {
    type: String,
    maxLength: 1000
  },
  application_answers: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  approved_by: {
    type: String // UUID from Auth Service
  },
  approved_at: {
    type: Date
  },
  joined_at: { 
    type: Date, 
    required: true,
    default: Date.now 
  },
  removed_at: {
    type: Date
  },
  removal_reason: {
    type: String,
    maxLength: 500
  },
  updated_at: { type: Date, default: Date.now }
});

// Create compound index for user_id and club_id to ensure uniqueness
membershipSchema.index({ club_id: 1, user_id: 1 }, { unique: true });
membershipSchema.index({ club_id: 1, status: 1 });
membershipSchema.index({ user_id: 1, status: 1 });
membershipSchema.index({ campaign_id: 1 });
membershipSchema.index({ joined_at: 1 });

// Define RecruitmentCampaign schema (renamed from RecruitmentRound)
const recruitmentCampaignSchema = new mongoose.Schema({
  club_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'Club' 
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
  requirements: { 
    type: String,
    maxLength: 1000 
  },
  application_questions: {
    type: [{
      id: { type: String, required: true },
      question: { type: String, required: true, maxLength: 500 },
      type: { 
        type: String, 
        required: true,
        enum: ['text', 'textarea', 'select', 'checkbox'] 
      },
      required: { type: Boolean, default: false },
      max_length: { type: Number },
      options: [{ type: String }]
    }],
    default: []
  },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  max_applications: { 
    type: Number, 
    min: 1 
  },
  status: { 
    type: String, 
    required: true,
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  },
  statistics: {
    type: {
      total_applications: { type: Number, min: 0, default: 0 },
      approved_applications: { type: Number, min: 0, default: 0 },
      rejected_applications: { type: Number, min: 0, default: 0 },
      pending_applications: { type: Number, min: 0, default: 0 },
      last_updated: { type: Date, default: Date.now }
    },
    default: {
      total_applications: 0,
      approved_applications: 0,
      rejected_applications: 0,
      pending_applications: 0,
      last_updated: new Date()
    }
  },
  // Backward compatibility fields
  criteria: { type: String }, // Deprecated, use requirements instead
  review_criteria: { type: mongoose.Schema.Types.Mixed, default: {} }, // Deprecated
  quota: { type: Number }, // Deprecated, use max_applications instead
  start_at: { type: Date }, // Deprecated, use start_date instead
  end_at: { type: Date }, // Deprecated, use end_date instead
  created_by: { 
    type: String,
    required: true
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

recruitmentCampaignSchema.index({ club_id: 1, status: 1 });
recruitmentCampaignSchema.index({ start_date: 1, end_date: 1 });
recruitmentCampaignSchema.index({ created_by: 1 });



// Create models
const Club = mongoose.model('Club', clubSchema);
const Membership = mongoose.model('Membership', membershipSchema);
const RecruitmentCampaign = mongoose.model('RecruitmentCampaign', recruitmentCampaignSchema);

// Backward compatibility alias
const RecruitmentRound = RecruitmentCampaign;

const connectToDatabase = async () => {
  try {
    // Use MongoDB connection string from environment variable
    const MONGO_URI = process.env.MONGODB_URI || 
                      process.env.MONGO_URI ||
                      'mongodb://localhost:27017/club_service';
                      
    // Add connection options for MongoDB Atlas
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Connection timeout: 5 seconds
      socketTimeoutMS: 45000, // Socket timeout: 45 seconds
      bufferCommands: false, // Disable mongoose buffering
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 1, // Maintain at least 1 connection
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      maxConnecting: 2, // Maximum number of connections that can be in the "connecting" state
    });
    
    console.log('✅ Connected to MongoDB Atlas - Club Service Database');
    console.log('🔗 Database:', MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    console.log('📊 MongoDB schemas initialized');
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'development' || process.env.MOCK_DB === 'true') {
      console.warn('⚠️ Running in development mode without database connection');
      return false;
    }
    
    throw error;
  }
};

module.exports = {
  connectToDatabase,
  Club,
  Membership,
  RecruitmentCampaign,
  RecruitmentRound // Backward compatibility
};
