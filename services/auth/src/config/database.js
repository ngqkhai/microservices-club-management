const config = require('./index');
 
module.exports = {
  development: config.getDatabaseConfig(),
  test: config.getTestDatabaseConfig(),
  production: config.getDatabaseConfig()
}; 