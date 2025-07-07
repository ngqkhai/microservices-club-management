const mongoose = require('mongoose');

// Define schemas outside the connection function
// Define Club schema based on the SQL schema
const clubSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  type: { type: String },
  size: { type: Number },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  logo_url: { type: String },
  website_url: { type: String },
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
  updated_at: { type: Date, default: Date.now }
});

// Text index on club name for search functionality
clubSchema.index({ name: 'text' });

// Define Membership schema
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
  role: { 
    type: String, 
    required: true,
    enum: ['MANAGER', 'MEMBER'] 
  },
  joined_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Create compound index for user_id and club_id to ensure uniqueness
membershipSchema.index({ club_id: 1, user_id: 1 }, { unique: true });
membershipSchema.index({ club_id: 1 });
membershipSchema.index({ user_id: 1 });

// Define RecruitmentRound schema
const recruitmentRoundSchema = new mongoose.Schema({
  club_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'Club' 
  },
  title: { type: String, required: true },
  description: { type: String },
  criteria: { type: String },
  review_criteria: { type: mongoose.Schema.Types.Mixed, default: {} },
  quota: { type: Number },
  start_at: { type: Date, required: true },
  end_at: { type: Date, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['OPEN', 'CLOSED', 'CANCELLED'] 
  },
  created_by: { 
    type: String 
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

recruitmentRoundSchema.index({ club_id: 1 });

// Define Application schema
const applicationSchema = new mongoose.Schema({
  round_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'RecruitmentRound' 
  },
  user_id: { 
    type: String, 
    required: true 
  },
  application_data: { type: mongoose.Schema.Types.Mixed, default: {} },
  attachment_url: { type: String },
  status: { 
    type: String, 
    required: true,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING' 
  },
  submitted_at: { type: Date, default: Date.now },
  review_score: { 
    type: Number,
    min: 0,
    max: 100 
  },
  review_comments: { type: String },
  reviewed_by: { 
    type: String 
  },
  reviewed_at: { type: Date },
  updated_at: { type: Date, default: Date.now }
});

applicationSchema.index({ round_id: 1, user_id: 1 }, { unique: true });
applicationSchema.index({ round_id: 1 });
applicationSchema.index({ user_id: 1 });
applicationSchema.index({ status: 1 });

// Define Announcement schema
const announcementSchema = new mongoose.Schema({
  club_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'Club' 
  },
  created_by: { 
    type: String, 
    required: true
  },
  title: { type: String, required: true },
  body: { type: String, required: true },
  attachment_url: { type: String },
  valid_until: { type: Date },
  created_at: { type: Date, default: Date.now }
});

announcementSchema.index({ club_id: 1 });

// Create models
const Club = mongoose.model('Club', clubSchema);
const Membership = mongoose.model('Membership', membershipSchema);
const RecruitmentRound = mongoose.model('RecruitmentRound', recruitmentRoundSchema);
const Application = mongoose.model('Application', applicationSchema);
const Announcement = mongoose.model('Announcement', announcementSchema);

const connectToDatabase = async () => {
  try {
    // Cho phép cấu hình MongoDB URI qua biến môi trường
    const MONGO_URI = process.env.MONGO_URI || 
                      'mongodb://localhost:27017/club_service';
                      
    // Thêm các tùy chọn kết nối
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Thời gian timeout khi kết nối: 5 giây
      socketTimeoutMS: 45000, // Thời gian socket timeout: 45 giây
    });
    
    console.log('Connected to MongoDB database:', MONGO_URI);
    console.log('MongoDB schemas initialized');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    
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
  RecruitmentRound,
  Application,
  Announcement
};
