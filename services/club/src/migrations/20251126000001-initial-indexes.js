/**
 * Initial Migration: Create database indexes for Club Service
 *
 * This migration documents the indexes that are defined in the Mongoose schemas.
 * These indexes are automatically created when Mongoose connects, but this migration
 * ensures they're tracked and can be managed via migrate-mongo.
 */

module.exports = {
  async up(db) {
    console.log('Creating indexes for clubs collection...');

    // Club indexes (matching clubSchema in database.js)
    await db.collection('clubs').createIndex({ name: 'text' }, { name: 'clubs_text_search' });
    await db.collection('clubs').createIndex({ category: 1 }, { name: 'clubs_category' });
    await db.collection('clubs').createIndex({ status: 1 }, { name: 'clubs_status' });
    await db.collection('clubs').createIndex({ 'manager.user_id': 1 }, { name: 'clubs_manager_user_id' });
    await db.collection('clubs').createIndex({ created_at: -1 }, { name: 'clubs_created_at' });
    await db.collection('clubs').createIndex({ deleted_at: 1 }, { name: 'clubs_soft_delete' });

    console.log('Creating indexes for memberships collection...');

    // Membership indexes (matching membershipSchema in database.js)
    await db.collection('memberships').createIndex(
      { club_id: 1, user_id: 1 },
      { unique: true, name: 'memberships_club_user_unique' }
    );
    await db.collection('memberships').createIndex({ club_id: 1, status: 1 }, { name: 'memberships_club_status' });
    await db.collection('memberships').createIndex({ user_id: 1, status: 1 }, { name: 'memberships_user_status' });
    await db.collection('memberships').createIndex({ campaign_id: 1 }, { name: 'memberships_campaign' });
    await db.collection('memberships').createIndex({ joined_at: 1 }, { name: 'memberships_joined_at' });

    console.log('Creating indexes for recruitmentcampaigns collection...');

    // Recruitment Campaign indexes (matching recruitmentCampaignSchema in database.js)
    await db.collection('recruitmentcampaigns').createIndex(
      { club_id: 1, status: 1 },
      { name: 'campaigns_club_status' }
    );
    await db.collection('recruitmentcampaigns').createIndex(
      { start_date: 1, end_date: 1 },
      { name: 'campaigns_date_range' }
    );
    await db.collection('recruitmentcampaigns').createIndex({ created_by: 1 }, { name: 'campaigns_created_by' });

    console.log('✅ All Club Service indexes created successfully');
  },

  async down(db) {
    // eslint-disable-next-line no-console
    console.log('Dropping indexes for clubs collection...');

    // Drop Club indexes - ignore errors if indexes don't exist
    try { await db.collection('clubs').dropIndex('clubs_text_search'); } catch (_e) { /* index may not exist */ }
    try { await db.collection('clubs').dropIndex('clubs_category'); } catch (_e) { /* index may not exist */ }
    try { await db.collection('clubs').dropIndex('clubs_status'); } catch (_e) { /* index may not exist */ }
    try { await db.collection('clubs').dropIndex('clubs_manager_user_id'); } catch (_e) { /* index may not exist */ }
    try { await db.collection('clubs').dropIndex('clubs_created_at'); } catch (_e) { /* index may not exist */ }
    try { await db.collection('clubs').dropIndex('clubs_soft_delete'); } catch (_e) { /* index may not exist */ }

    // eslint-disable-next-line no-console
    console.log('Dropping indexes for memberships collection...');

    // Drop Membership indexes - ignore errors if indexes don't exist
    try { await db.collection('memberships').dropIndex('memberships_club_user_unique'); } catch (_e) { /* index may not exist */ }
    try { await db.collection('memberships').dropIndex('memberships_club_status'); } catch (_e) { /* index may not exist */ }
    try { await db.collection('memberships').dropIndex('memberships_user_status'); } catch (_e) { /* index may not exist */ }
    try { await db.collection('memberships').dropIndex('memberships_campaign'); } catch (_e) { /* index may not exist */ }
    try { await db.collection('memberships').dropIndex('memberships_joined_at'); } catch (_e) { /* index may not exist */ }

    // eslint-disable-next-line no-console
    console.log('Dropping indexes for recruitmentcampaigns collection...');

    // Drop Recruitment Campaign indexes - ignore errors if indexes don't exist
    try { await db.collection('recruitmentcampaigns').dropIndex('campaigns_club_status'); } catch (_e) { /* index may not exist */ }
    try { await db.collection('recruitmentcampaigns').dropIndex('campaigns_date_range'); } catch (_e) { /* index may not exist */ }
    try { await db.collection('recruitmentcampaigns').dropIndex('campaigns_created_by'); } catch (_e) { /* index may not exist */ }

    // eslint-disable-next-line no-console
    console.log('✅ All Club Service indexes dropped');
  }
};

