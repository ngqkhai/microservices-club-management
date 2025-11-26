// Test script to diagnose module loading issues
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
  process.exit(1);
});

try {
  console.log('1. Loading config...');
  const config = require('./src/config');
  console.log('   Config loaded OK');
  
  console.log('2. Loading logger...');
  const logger = require('./src/config/logger');
  console.log('   Logger loaded OK');
  
  console.log('3. Loading clubRoutes...');
  const clubRoutes = require('./src/routes/clubRoutes');
  console.log('   clubRoutes loaded OK');
  
  console.log('4. Loading database...');
  const { connectToDatabase } = require('./src/config/database');
  console.log('   database loaded OK');
  
  console.log('\n✅ All modules loaded successfully!');
} catch (error) {
  console.error('\n❌ ERROR during module loading:');
  console.error('   Message:', error.message);
  console.error('   Stack:', error.stack);
  process.exit(1);
}

