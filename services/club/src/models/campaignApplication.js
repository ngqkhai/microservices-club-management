const mongoose = require('mongoose');

const campaignApplicationSchema = new mongoose.Schema({
  // Basic Information
  campaign_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecruitmentCampaign',
    required: true,
    index: true
  },
  club_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true,
    index: true
  },
  user_id: {
    type: String,
    required: true,
    index: true
  },
  user_email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },

  // Application Data
  answers: [{
    question_id: {
      type: String,
      required: true
    },
    answer: {
      type: mongoose.Schema.Types.Mixed, // Can be string, array, etc.
      required: true
    }
  }],

  // Status Management
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'withdrawn'],
    default: 'pending',
    index: true
  },
  
  // Review Information
  reviewed_by: {
    type: String, // User ID of reviewer
    default: null
  },
  reviewed_at: {
    type: Date,
    default: null
  },
  review_notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  rejection_reason: {
    type: String,
    trim: true,
    maxlength: 500
  },

  // Membership Information (if approved)
  assigned_role: {
    type: String,
    enum: ['member', 'organizer'],
    sparse: true  // Allow null/undefined values and don't validate them
  },
  membership_created: {
    type: Boolean,
    default: false
  },
  membership_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Membership',
    default: null
  },

  // Timestamps
  submitted_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Compound Indexes
campaignApplicationSchema.index({ campaign_id: 1, user_id: 1 }, { unique: true });
campaignApplicationSchema.index({ club_id: 1, status: 1 });
campaignApplicationSchema.index({ user_id: 1, status: 1 });

// Pre-save middleware
campaignApplicationSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Instance Methods
campaignApplicationSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    campaign_id: this.campaign_id,
    status: this.status,
    submitted_at: this.submitted_at,
    updated_at: this.updated_at,
    review_notes: this.review_notes,
    rejection_reason: this.rejection_reason,
    assigned_role: this.assigned_role
  };
};

campaignApplicationSchema.methods.toManagerJSON = function() {
  return {
    id: this._id,
    campaign_id: this.campaign_id,
    club_id: this.club_id,
    user_id: this.user_id,
    user_email: this.user_email,
    answers: this.answers,
    status: this.status,
    reviewed_by: this.reviewed_by,
    reviewed_at: this.reviewed_at,
    review_notes: this.review_notes,
    rejection_reason: this.rejection_reason,
    assigned_role: this.assigned_role,
    membership_created: this.membership_created,
    submitted_at: this.submitted_at,
    updated_at: this.updated_at
  };
};

// Static Methods
campaignApplicationSchema.statics.findByUser = function(userId, status = null) {
  const query = { user_id: userId };
  if (status) query.status = status;
  return this.find(query).sort({ submitted_at: -1 });
};

campaignApplicationSchema.statics.findByCampaign = function(campaignId, options = {}) {
  const { status, page = 1, limit = 10 } = options;
  const query = { campaign_id: campaignId };
  if (status) query.status = status;
  
  const skip = (page - 1) * limit;
  return this.find(query)
    .sort({ submitted_at: -1 })
    .skip(skip)
    .limit(limit);
};

campaignApplicationSchema.statics.countByCampaign = function(campaignId, status = null) {
  const query = { campaign_id: campaignId };
  if (status) query.status = status;
  return this.countDocuments(query);
};

const CampaignApplication = mongoose.model('CampaignApplication', campaignApplicationSchema);

module.exports = CampaignApplication;
