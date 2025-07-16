// MongoDB Atlas Setup Script
// Run this in MongoDB Atlas Data Explorer or MongoDB Compass

// ============================================
// CLUB SERVICE DATABASE SETUP
// ============================================

// Switch to club database
use('club_service');

// Create clubs collection with validation
db.createCollection('clubs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'description', 'category', 'status', 'created_at'],
      properties: {
        _id: { bsonType: 'objectId' },
        name: { bsonType: 'string', maxLength: 100 },
        description: { bsonType: 'string', maxLength: 1000 },
        category: { 
          enum: ['academic', 'sports', 'arts', 'technology', 'social', 'professional', 'hobby', 'volunteer', 'other'] 
        },
        status: { enum: ['active', 'inactive', 'pending', 'suspended'] },
        meeting_schedule: { bsonType: 'string', maxLength: 500 },
        location: { bsonType: 'string', maxLength: 200 },
        contact_email: { bsonType: 'string', maxLength: 100 },
        contact_phone: { bsonType: 'string', maxLength: 20 },
        social_links: {
          bsonType: 'object',
          properties: {
            website: { bsonType: 'string' },
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
        recruitment: {
          bsonType: 'object',
          properties: {
            is_recruiting: { bsonType: 'bool' },
            recruitment_message: { bsonType: 'string', maxLength: 1000 },
            application_questions: {
              bsonType: 'array',
              items: {
                bsonType: 'object',
                required: ['question', 'type'],
                properties: {
                  question: { bsonType: 'string', maxLength: 500 },
                  type: { enum: ['text', 'textarea', 'select', 'checkbox', 'radio'] },
                  required: { bsonType: 'bool' },
                  options: {
                    bsonType: 'array',
                    items: { bsonType: 'string' }
                  }
                }
              }
            }
          }
        },
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' }
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
        joined_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
});

// ============================================
// EVENT SERVICE DATABASE SETUP
// ============================================

// Switch to event database
use('event_service');

// Create events collection with validation
db.createCollection('events', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'description', 'club_id', 'start_date', 'end_date', 'status', 'created_at'],
      properties: {
        _id: { bsonType: 'objectId' },
        title: { bsonType: 'string', maxLength: 200 },
        description: { bsonType: 'string', maxLength: 2000 },
        club_id: { bsonType: 'objectId' },
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
        participation_fee: { 
          bsonType: ['double', 'int'], 
          minimum: 0,
          description: 'Fee in dollars - accepts both integers and decimals'
        },
        registration_required: { bsonType: 'bool' },
        registration_deadline: { bsonType: 'date' },
        status: { enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'] },
        visibility: { enum: ['public', 'members_only', 'private'] },
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
        organizers: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['user_id', 'role'],
            properties: {
              user_id: { bsonType: 'string' },
              role: { enum: ['primary', 'secondary', 'volunteer'] },
              responsibilities: { bsonType: 'string' }
            }
          }
        },
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
});

// Create registrations collection with validation
db.createCollection('registrations', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['event_id', 'user_id', 'status', 'registered_at'],
      properties: {
        _id: { bsonType: 'objectId' },
        event_id: { bsonType: 'objectId' },
        user_id: { bsonType: 'string' },
        status: { enum: ['registered', 'waitlisted', 'cancelled', 'attended', 'no_show'] },
        registration_data: {
          bsonType: 'object',
          properties: {
            dietary_requirements: { bsonType: 'string' },
            emergency_contact: { bsonType: 'string' },
            additional_notes: { bsonType: 'string' }
          }
        },
        payment_status: { enum: ['pending', 'paid', 'refunded', 'waived'] },
        payment_reference: { bsonType: 'string' },
        registered_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
});

// Create event_interests collection with validation
db.createCollection('event_interests', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['event_id', 'user_id', 'created_at'],
      properties: {
        _id: { bsonType: 'objectId' },
        event_id: { bsonType: 'objectId' },
        user_id: { bsonType: 'string' },
        created_at: { bsonType: 'date' }
      }
    }
  }
});

// ============================================
// CREATE INDEXES FOR PERFORMANCE
// ============================================

// Club indexes
use('club_service');
db.clubs.createIndex({ "name": 1 }, { unique: true });
db.clubs.createIndex({ "category": 1 });
db.clubs.createIndex({ "status": 1 });
db.clubs.createIndex({ "created_at": -1 });

db.memberships.createIndex({ "club_id": 1, "user_id": 1 }, { unique: true });
db.memberships.createIndex({ "user_id": 1 });
db.memberships.createIndex({ "club_id": 1 });
db.memberships.createIndex({ "status": 1 });

// Event indexes
use('event_service');
db.events.createIndex({ "club_id": 1 });
db.events.createIndex({ "start_date": 1 });
db.events.createIndex({ "status": 1 });
db.events.createIndex({ "visibility": 1 });
db.events.createIndex({ "tags": 1 });
db.events.createIndex({ "title": "text", "description": "text" });

db.registrations.createIndex({ "event_id": 1, "user_id": 1 }, { unique: true });
db.registrations.createIndex({ "user_id": 1 });
db.registrations.createIndex({ "event_id": 1 });
db.registrations.createIndex({ "status": 1 });

db.event_interests.createIndex({ "event_id": 1, "user_id": 1 }, { unique: true });
db.event_interests.createIndex({ "user_id": 1 });

console.log('MongoDB collections created successfully with validation schemas and indexes!'); 