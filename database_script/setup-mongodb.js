// =====================================================
// CLUB MANAGEMENT SYSTEM - MONGODB SETUP
// Updated: July 2025
// Based on current service models (ignoring outdated migrations)
// =====================================================

// ============================================
// CLUB SERVICE DATABASE SETUP (MongoDB)
// Port: 3002 - Club management and recruitment
// ============================================

// Switch to club database
use('club_service');

// Create clubs collection with validation
db.createCollection('clubs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'category', 'status', 'manager', 'created_by'],
      properties: {
        _id: { bsonType: 'objectId' },
        name: { bsonType: 'string', maxLength: 100 },
        description: { bsonType: 'string', maxLength: 1000 },
        category: { 
          enum: ['Học thuật', 'Thể thao', 'Nghệ thuật', 'Công nghệ', 'Xã hội', 'Chuyên nghiệp', 'Sở thích', 'Tình nguyện', 'Khác'] 
        },
        location: {
          bsonType: 'object',
          required: ['type', 'coordinates'],
          properties: {
            type: { bsonType: 'string', enum: ['Point'] },
            coordinates: {
              bsonType: 'array',
              items: { bsonType: 'double' },
              minItems: 2,
              maxItems: 2
            }
          }
        },
        contact_email: { bsonType: 'string', pattern: '^.+@.+\\..+$' },
        contact_phone: { bsonType: 'string', pattern: '^\\+?[0-9]{10,15}$' },
        logo_url: { bsonType: 'string' },
        website_url: { bsonType: 'string' },
        social_links: {
          bsonType: 'object',
          properties: {
            facebook: { bsonType: 'string' },
            instagram: { bsonType: 'string' },
            twitter: { bsonType: 'string' },
            linkedin: { bsonType: 'string' }
          }
        },
        settings: {
          bsonType: 'object',
          properties: {
            max_members: { bsonType: 'int', minimum: 1 },
            is_public: { bsonType: 'bool' },
            requires_approval: { bsonType: 'bool' },
          }
        },
        status: { enum: ['ACTIVE', 'INACTIVE'] },
        created_by: { bsonType: 'string', description: 'User ID from Auth Service' },
        manager: {
          bsonType: 'object',
          required: ['user_id', 'full_name', 'assigned_at'],
          properties: {
            user_id: { bsonType: 'string' },
            full_name: { bsonType: 'string', maxLength: 255 },
            email: { bsonType: 'string' },
            assigned_at: { bsonType: 'date' }
          }
        },
        contact_info: {
          bsonType: 'object',
          properties: {
            email: { bsonType: 'string' },
            phone: { bsonType: 'string' },
            address: { bsonType: 'string' },
            website: { bsonType: 'string' }
          }
        },
        social_links: {
          bsonType: 'object',
          properties: {
            facebook: { bsonType: 'string' },
            instagram: { bsonType: 'string' },
            twitter: { bsonType: 'string' },
            linkedin: { bsonType: 'string' }
          }
        },
        settings: {
          bsonType: 'object',
          properties: {
            max_members: { bsonType: 'int', minimum: 1 },
            is_public: { bsonType: 'bool' },
            requires_approval: { bsonType: 'bool' },
            allow_member_invites: { bsonType: 'bool' }
          }
        },
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' },
        deleted_at: { bsonType: 'date' }
      }
    }
  }
});

// Create memberships collection with validation
db.createCollection('memberships', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['club_id', 'user_id', 'role', 'status', 'joined_at'],
      properties: {
        _id: { bsonType: 'objectId' },
        club_id: { bsonType: 'objectId' },
        user_id: { bsonType: 'string' },
        role: { enum: ['owner', 'admin', 'member'] },
        status: { enum: ['active', 'inactive', 'pending', 'rejected', 'banned'] },
        campaign_id: { bsonType: 'string' },
        application_answers: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['question', 'answer'],
            properties: {
              question: { bsonType: 'string' },
              answer: { bsonType: 'string' },
              type: { bsonType: 'string' }
            }
          }
        },
// Create memberships collection with validation
db.createCollection('memberships', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['club_id', 'user_id', 'role', 'status', 'joined_at'],
      properties: {
        _id: { bsonType: 'objectId' },
        club_id: { bsonType: 'objectId' },
        user_id: { bsonType: 'string', description: 'User ID from Auth Service' },
        campaign_id: { bsonType: 'objectId' },
        role: { enum: ['member', 'organizer', 'club_manager'] },
        status: { enum: ['active', 'pending', 'rejected', 'removed'] },
        application_message: { bsonType: 'string', maxLength: 1000 },
        application_answers: { bsonType: 'object' },
        approved_by: { bsonType: 'string' },
        approved_at: { bsonType: 'date' },
        joined_at: { bsonType: 'date' },
        removed_at: { bsonType: 'date' },
        removal_reason: { bsonType: 'string', maxLength: 500 },
      }
    }
  }
});

// Create recruitment campaigns collection
db.createCollection('recruitment_campaigns', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['club_id', 'title', 'start_date', 'end_date', 'status', 'created_by'],
      properties: {
        _id: { bsonType: 'objectId' },
        club_id: { bsonType: 'objectId' },
        title: { bsonType: 'string', maxLength: 200 },
        description: { bsonType: 'string', maxLength: 2000 },
        requirements: {
          bsonType: 'array',
          items: { bsonType: 'string' }
        },
        application_questions: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['id', 'question', 'type'],
            properties: {
              id: { bsonType: 'string' },
              question: { bsonType: 'string', maxLength: 500 },
              type: { enum: ['text', 'textarea', 'select', 'checkbox'] },
              required: { bsonType: 'bool' },
              options: {
                bsonType: 'array',
                items: { bsonType: 'string' }
              }
            }
          }
        },
        start_date: { bsonType: 'date' },
        end_date: { bsonType: 'date' },
        max_applications: { bsonType: 'int', minimum: 1 },
        status: { enum: ['draft', 'active', 'paused', 'completed', 'cancelled'] },
        statistics: {
          bsonType: 'object',
          properties: {
            total_applications: { bsonType: 'int', minimum: 0 },
            approved_applications: { bsonType: 'int', minimum: 0 },
            rejected_applications: { bsonType: 'int', minimum: 0 },
            pending_applications: { bsonType: 'int', minimum: 0 },
            last_updated: { bsonType: 'date' }
          }
        },
        created_by: { bsonType: 'string' },
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
});

// ============================================
// EVENT SERVICE DATABASE SETUP (MongoDB)
// Port: 3003 - Event management
// ============================================

// Switch to event database
use('event_service');

// Create events collection with validation
db.createCollection('events', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'description', 'club_id', 'start_date', 'end_date', 'status', 'created_by'],
      properties: {
        _id: { bsonType: 'objectId' },
        title: { bsonType: 'string', maxLength: 200 },
        description: { bsonType: 'string', maxLength: 2000 },
        club_id: { bsonType: 'string', description: 'Club ID from Club Service' },
        start_date: { bsonType: 'date' },
        end_date: { bsonType: 'date' },
        location: {
          bsonType: 'object',
          properties: {
            venue_name: { bsonType: 'string', maxLength: 200 },
            address: { bsonType: 'string', maxLength: 500 },
            room: { bsonType: 'string', maxLength: 100 },
            coordinates: {
              bsonType: 'object',
              properties: {
                latitude: { bsonType: 'double' },
                longitude: { bsonType: 'double' }
              }
            },
            is_virtual: { bsonType: 'bool' },
            virtual_link: { bsonType: 'string' }
          }
        },
        capacity: { bsonType: 'int', minimum: 1 },
        participation_fee: { bsonType: 'double', minimum: 0 },
        category: { bsonType: 'string' },
        visibility: { enum: ['public', 'members_only', 'private'] },
        registration_required: { bsonType: 'bool' },
        registration_deadline: { bsonType: 'date' },
        status: { enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'] },
        tags: {
          bsonType: 'array',
          items: { bsonType: 'string' }
        },
        attachments: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['filename', 'url', 'type'],
            properties: {
              filename: { bsonType: 'string' },
              url: { bsonType: 'string' },
              type: { bsonType: 'string' },
              size: { bsonType: 'int' }
            }
          }
        },
        statistics: {
          bsonType: 'object',
          properties: {
            total_registrations: { bsonType: 'int', minimum: 0 },
            total_interested: { bsonType: 'int', minimum: 0 },
            total_attended: { bsonType: 'int', minimum: 0 }
          }
        },
        created_by: { bsonType: 'string', description: 'User ID from Auth Service' },
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
});

// Create event registrations collection
db.createCollection('registrations', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['event_id', 'user_id', 'status', 'registered_at'],
      properties: {
        _id: { bsonType: 'objectId' },
        event_id: { bsonType: 'objectId' },
        user_id: { bsonType: 'string', description: 'User ID from Auth Service' },
        status: { enum: ['registered', 'waitlisted', 'cancelled', 'attended', 'no_show'] },
        ticket_id: { bsonType: 'string' },
        payment_status: { enum: ['pending', 'paid', 'refunded', 'waived'] },
        payment_reference: { bsonType: 'string' },
        registration_data: { bsonType: 'object' },
        registered_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
});

// Create event interests collection  
db.createCollection('event_interests', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['event_id', 'user_id', 'marked_at'],
      properties: {
        _id: { bsonType: 'objectId' },
        event_id: { bsonType: 'objectId' },
        user_id: { bsonType: 'string', description: 'User ID from Auth Service' },
        notifications_enabled: { bsonType: 'bool' },
        marked_at: { bsonType: 'date' }
      }
    }
  }
});

// Create participants collection
db.createCollection('participants', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['event_id', 'user_id', 'joined_at'],
      properties: {
        _id: { bsonType: 'objectId' },
        event_id: { bsonType: 'objectId' },
        user_id: { bsonType: 'string', description: 'User ID from Auth Service' },
        joined_at: { bsonType: 'date' }
      }
    }
  }
});

// Create organizers collection
db.createCollection('organizers', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['event_id', 'user_id'],
      properties: {
        _id: { bsonType: 'objectId' },
        event_id: { bsonType: 'objectId' },
        user_id: { bsonType: 'string', description: 'User ID from Auth Service' }
      }
    }
  }
});

// ============================================
// CREATE INDEXES FOR PERFORMANCE
// ============================================

// Club Service indexes
use('club_service');
db.clubs.createIndex({ "name": 1 }, { unique: true });
db.clubs.createIndex({ "name": "text", "description": "text" });
db.clubs.createIndex({ "category": 1 });
db.clubs.createIndex({ "status": 1 });
db.clubs.createIndex({ "created_by": 1 });
db.clubs.createIndex({ "created_at": -1 });

db.memberships.createIndex({ "club_id": 1, "user_id": 1 }, { unique: true });
db.memberships.createIndex({ "user_id": 1 });
db.memberships.createIndex({ "club_id": 1, "status": 1 });
db.memberships.createIndex({ "campaign_id": 1 });
db.memberships.createIndex({ "joined_at": 1 });

db.recruitment_campaigns.createIndex({ "club_id": 1 });
db.recruitment_campaigns.createIndex({ "status": 1 });
db.recruitment_campaigns.createIndex({ "start_date": 1, "end_date": 1 });
db.recruitment_campaigns.createIndex({ "created_by": 1 });

// Event Service indexes
use('event_service');
db.events.createIndex({ "title": "text", "description": "text", "tags": "text" });
db.events.createIndex({ "club_id": 1, "status": 1 });
db.events.createIndex({ "start_date": 1, "end_date": 1 });
db.events.createIndex({ "category": 1 });
db.events.createIndex({ "visibility": 1 });
db.events.createIndex({ "created_by": 1 });
db.events.createIndex({ "registration_deadline": 1 });

db.registrations.createIndex({ "event_id": 1, "user_id": 1 }, { unique: true });
db.registrations.createIndex({ "event_id": 1, "status": 1 });
db.registrations.createIndex({ "user_id": 1, "status": 1 });
db.registrations.createIndex({ "registered_at": 1 });
db.registrations.createIndex({ "ticket_id": 1 }, { unique: true });

db.event_interests.createIndex({ "event_id": 1, "user_id": 1 }, { unique: true });
db.event_interests.createIndex({ "user_id": 1 });
db.event_interests.createIndex({ "marked_at": 1 });

db.participants.createIndex({ "event_id": 1, "user_id": 1 }, { unique: true });
db.participants.createIndex({ "user_id": 1 });

db.organizers.createIndex({ "event_id": 1, "user_id": 1 }, { unique: true });

console.log('✅ MongoDB collections created successfully with validation schemas and indexes!');
console.log('📊 Club Service: clubs, memberships, recruitment_campaigns');
console.log('🎯 Event Service: events, registrations, event_interests, participants, organizers'); 