/**
 * Initial Migration: Create database indexes for Event Service
 *
 * This migration documents the indexes that are defined in the Mongoose schemas.
 * These indexes are automatically created when Mongoose connects, but this migration
 * ensures they're tracked and can be managed via migrate-mongo.
 */

module.exports = {
  async up(db) {
    console.log('Creating indexes for events collection...');

    // Event indexes (matching eventSchema in models/event.js)
    await db.collection('events').createIndex(
      { title: 'text', description: 'text', tags: 'text' },
      { name: 'events_text_search' }
    );
    await db.collection('events').createIndex({ club_id: 1 }, { name: 'events_club_id' });
    await db.collection('events').createIndex({ club_id: 1, status: 1 }, { name: 'events_club_status' });
    await db.collection('events').createIndex({ start_date: 1 }, { name: 'events_start_date' });
    await db.collection('events').createIndex({ start_date: 1, end_date: 1 }, { name: 'events_date_range' });
    await db.collection('events').createIndex({ category: 1 }, { name: 'events_category' });
    await db.collection('events').createIndex({ visibility: 1 }, { name: 'events_visibility' });
    await db.collection('events').createIndex({ created_by: 1 }, { name: 'events_created_by' });
    await db.collection('events').createIndex({ registration_deadline: 1 }, { name: 'events_registration_deadline' });
    await db.collection('events').createIndex({ status: 1 }, { name: 'events_status' });

    console.log('Creating indexes for event_registrations collection...');

    // Registration indexes (matching registrationSchema in models/registration.js)
    await db.collection('event_registrations').createIndex(
      { event_id: 1, user_id: 1 },
      { unique: true, name: 'registrations_event_user_unique' }
    );
    await db.collection('event_registrations').createIndex({ event_id: 1 }, { name: 'registrations_event_id' });
    await db.collection('event_registrations').createIndex({ user_id: 1 }, { name: 'registrations_user_id' });
    await db.collection('event_registrations').createIndex({ event_id: 1, status: 1 }, { name: 'registrations_event_status' });
    await db.collection('event_registrations').createIndex({ user_id: 1, status: 1 }, { name: 'registrations_user_status' });
    await db.collection('event_registrations').createIndex({ registered_at: 1 }, { name: 'registrations_registered_at' });
    await db.collection('event_registrations').createIndex({ ticket_id: 1 }, { unique: true, name: 'registrations_ticket_id' });

    console.log('Creating indexes for event_interests collection...');

    // Event Interests indexes
    await db.collection('event_interests').createIndex(
      { event_id: 1, user_id: 1, interest_type: 1 },
      { unique: true, name: 'interests_event_user_type_unique' }
    );
    await db.collection('event_interests').createIndex({ user_id: 1, interest_type: 1 }, { name: 'interests_user_type' });

    console.log('✅ All Event Service indexes created successfully');
  },

  async down(db) {
    // eslint-disable-next-line no-console
    console.log('Dropping indexes for events collection...');

    // Drop Event indexes - ignore errors if indexes don't exist
    try { await db.collection('events').dropIndex('events_text_search'); } catch (_e) { /* index may not exist */ }
    try { await db.collection('events').dropIndex('events_club_id'); } catch (_e) { /* index may not exist */ }
    try { await db.collection('events').dropIndex('events_club_status'); } catch (_e) { /* index may not exist */ }
    try { await db.collection('events').dropIndex('events_start_date'); } catch (_e) { /* index may not exist */ }
    try { await db.collection('events').dropIndex('events_date_range'); } catch (_e) { /* index may not exist */ }
    try { await db.collection('events').dropIndex('events_category'); } catch (_e) { /* index may not exist */ }
    try { await db.collection('events').dropIndex('events_visibility'); } catch (_e) { /* index may not exist */ }
    try { await db.collection('events').dropIndex('events_created_by'); } catch (_e) { /* index may not exist */ }
    try { await db.collection('events').dropIndex('events_registration_deadline'); } catch (_e) { /* index may not exist */ }
    try { await db.collection('events').dropIndex('events_status'); } catch (_e) { /* index may not exist */ }

    // eslint-disable-next-line no-console
    console.log('Dropping indexes for event_registrations collection...');

    // Drop Registration indexes - ignore errors if indexes don't exist
    try { await db.collection('event_registrations').dropIndex('registrations_event_user_unique'); } catch (_e) { /* index may not exist */ }
    try { await db.collection('event_registrations').dropIndex('registrations_event_id'); } catch (_e) { /* index may not exist */ }
    try { await db.collection('event_registrations').dropIndex('registrations_user_id'); } catch (_e) { /* index may not exist */ }
    try { await db.collection('event_registrations').dropIndex('registrations_event_status'); } catch (_e) { /* index may not exist */ }
    try { await db.collection('event_registrations').dropIndex('registrations_user_status'); } catch (_e) { /* index may not exist */ }
    try { await db.collection('event_registrations').dropIndex('registrations_registered_at'); } catch (_e) { /* index may not exist */ }
    try { await db.collection('event_registrations').dropIndex('registrations_ticket_id'); } catch (_e) { /* index may not exist */ }

    // eslint-disable-next-line no-console
    console.log('Dropping indexes for event_interests collection...');

    // Drop Event Interests indexes - ignore errors if indexes don't exist
    try { await db.collection('event_interests').dropIndex('interests_event_user_type_unique'); } catch (_e) { /* index may not exist */ }
    try { await db.collection('event_interests').dropIndex('interests_user_type'); } catch (_e) { /* index may not exist */ }

    // eslint-disable-next-line no-console
    console.log('✅ All Event Service indexes dropped');
  }
};

