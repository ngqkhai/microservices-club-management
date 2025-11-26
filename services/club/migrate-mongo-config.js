/**
 * migrate-mongo configuration for Club Service
 * 
 * Usage:
 *   npx migrate-mongo up     - Run pending migrations
 *   npx migrate-mongo down   - Rollback last migration
 *   npx migrate-mongo status - Check migration status
 *   npx migrate-mongo create <name> - Create new migration
 */

const config = {
  mongodb: {
    url: process.env.MONGODB_URI || 'mongodb://club_user:club_password@localhost:27017/club_service_db?authSource=club_service_db',
    
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },

  // The migrations directory
  migrationsDir: 'src/migrations',

  // The mongodb collection where the applied changes are stored
  changelogCollectionName: 'changelog',

  // The file extension to create migrations and search for in migration dir
  migrationFileExtension: '.js',

  // Enable the algorithm to create a checksum of the file contents
  useFileHash: false,

  // Don't change this, unless you know what you're doing
  moduleSystem: 'commonjs'
};

module.exports = config;

