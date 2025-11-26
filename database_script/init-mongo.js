// =============================================================================
// MongoDB Initialization Script
// =============================================================================
// This script runs automatically when the MongoDB container starts for the
// first time. It creates the databases and users for Club and Event services.
// =============================================================================

// Switch to admin database for creating users
db = db.getSiblingDB('admin');

print('🔧 Initializing MongoDB databases...');

// -----------------------------------------------------------------------------
// Create Club Service Database
// -----------------------------------------------------------------------------
db = db.getSiblingDB('club_service_db');

// Create a user for club service
db.createUser({
  user: 'club_service',
  pwd: 'club_service_local_dev',
  roles: [
    { role: 'readWrite', db: 'club_service_db' }
  ]
});

// Create initial collections with schema validation hints
db.createCollection('clubs');
db.createCollection('memberships');
db.createCollection('recruitmentcampaigns');
db.createCollection('campaignapplications');

// Create indexes for clubs collection
db.clubs.createIndex({ name: 'text' });
db.clubs.createIndex({ category: 1 });
db.clubs.createIndex({ status: 1 });
db.clubs.createIndex({ 'manager.user_id': 1 });
db.clubs.createIndex({ created_at: -1 });

// Create indexes for memberships collection
db.memberships.createIndex({ club_id: 1, user_id: 1 }, { unique: true });
db.memberships.createIndex({ club_id: 1, status: 1 });
db.memberships.createIndex({ user_id: 1, status: 1 });
db.memberships.createIndex({ campaign_id: 1 });
db.memberships.createIndex({ joined_at: 1 });

// Create indexes for recruitment campaigns
db.recruitmentcampaigns.createIndex({ club_id: 1, status: 1 });
db.recruitmentcampaigns.createIndex({ start_date: 1, end_date: 1 });
db.recruitmentcampaigns.createIndex({ created_by: 1 });

// Create indexes for campaign applications
db.campaignapplications.createIndex({ campaign_id: 1, user_id: 1 }, { unique: true });
db.campaignapplications.createIndex({ club_id: 1, status: 1 });
db.campaignapplications.createIndex({ user_id: 1, status: 1 });

print('✅ Club Service database initialized');

// -----------------------------------------------------------------------------
// Create Event Service Database
// -----------------------------------------------------------------------------
db = db.getSiblingDB('event_service_db');

// Create a user for event service
db.createUser({
  user: 'event_service',
  pwd: 'event_service_local_dev',
  roles: [
    { role: 'readWrite', db: 'event_service_db' }
  ]
});

// Create initial collections
db.createCollection('events');
db.createCollection('event_registrations');
db.createCollection('event_interests');
db.createCollection('event_tasks');

// Create indexes for events collection
db.events.createIndex({ title: 'text', description: 'text', tags: 'text' });
db.events.createIndex({ club_id: 1, status: 1 });
db.events.createIndex({ start_date: 1, end_date: 1 });
db.events.createIndex({ category: 1 });
db.events.createIndex({ visibility: 1 });
db.events.createIndex({ created_by: 1 });
db.events.createIndex({ registration_deadline: 1 });

// Create indexes for registrations
db.event_registrations.createIndex({ event_id: 1, user_id: 1 }, { unique: true });
db.event_registrations.createIndex({ event_id: 1, status: 1 });
db.event_registrations.createIndex({ user_id: 1, status: 1 });
db.event_registrations.createIndex({ registered_at: 1 });
db.event_registrations.createIndex({ ticket_id: 1 }, { unique: true });

// Create indexes for event interests
db.event_interests.createIndex({ event_id: 1, user_id: 1 }, { unique: true });
db.event_interests.createIndex({ user_id: 1 });
db.event_interests.createIndex({ marked_at: 1 });

// Create indexes for event tasks
db.event_tasks.createIndex({ event_id: 1 });
db.event_tasks.createIndex({ assigned_to: 1 });
db.event_tasks.createIndex({ status: 1 });
db.event_tasks.createIndex({ due_date: 1 });

print('✅ Event Service database initialized');

print('');
print('='.repeat(60));
print('📦 MongoDB initialization complete!');
print('='.repeat(60));
print('');
print('Databases created:');
print('  - club_service_db (user: club_service)');
print('  - event_service_db (user: event_service)');
print('');
print('Connection strings for local development:');
print('  - Club:  mongodb://club_service:club_service_local_dev@localhost:27017/club_service_db');
print('  - Event: mongodb://event_service:event_service_local_dev@localhost:27017/event_service_db');
print('  - Admin: mongodb://mongo:mongo_local_dev@localhost:27017');
print('');

