#!/usr/bin/env node

/**
 * Debug script to identify auth service startup issues
 * Run this to get detailed error information
 */

console.log('🔍 Auth Service Startup Debug Script');
console.log('====================================\n');

// Test 1: Environment Loading
console.log('1. Testing environment loading...');
try {
  require('dotenv').config();
  console.log('✅ Environment variables loaded');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   PORT: ${process.env.PORT}`);
  console.log(`   DB_NAME: ${process.env.DB_NAME ? '✅ Set' : '❌ Missing'}`);
  console.log(`   DB_USERNAME: ${process.env.DB_USERNAME ? '✅ Set' : '❌ Missing'}`);
  console.log(`   DB_PASSWORD: ${process.env.DB_PASSWORD ? '✅ Set' : '❌ Missing'}`);
  console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'}`);
  console.log(`   REFRESH_TOKEN_SECRET: ${process.env.REFRESH_TOKEN_SECRET ? '✅ Set' : '❌ Missing'}`);
} catch (error) {
  console.log('❌ Environment loading failed:', error.message);
  process.exit(1);
}

console.log('\n2. Testing configuration loading...');
try {
  const config = require('./src/config/index');
  console.log('✅ Configuration loaded successfully');
  console.log(`   Environment: ${config.get('NODE_ENV')}`);
  console.log(`   Port: ${config.get('PORT')}`);
  console.log(`   Database: ${config.get('DB_NAME')}`);
} catch (error) {
  console.log('❌ Configuration loading failed:', error.message);
  console.log('Stack trace:', error.stack);
  process.exit(1);
}

console.log('\n3. Testing logger...');
try {
  const logger = require('./src/config/logger');
  logger.info('Logger test message');
  console.log('✅ Logger working correctly');
} catch (error) {
  console.log('❌ Logger failed:', error.message);
  console.log('Stack trace:', error.stack);
}

console.log('\n4. Testing database connection...');
try {
  const { testConnection } = require('./src/models');
  testConnection().then((connected) => {
    if (connected) {
      console.log('✅ Database connection successful');
    } else {
      console.log('❌ Database connection failed');
    }
    testRabbitMQ();
  }).catch((error) => {
    console.log('❌ Database connection error:', error.message);
    testRabbitMQ();
  });
} catch (error) {
  console.log('❌ Database setup failed:', error.message);
  console.log('Stack trace:', error.stack);
  testRabbitMQ();
}

function testRabbitMQ() {
  console.log('\n5. Testing RabbitMQ configuration...');
  try {
    const rabbitmqConfig = require('./src/config/rabbitmq');
    console.log('✅ RabbitMQ config loaded');
    console.log(`   URL: ${rabbitmqConfig.url}`);
    console.log(`   Exchange: ${rabbitmqConfig.exchange}`);
    console.log(`   Queue: ${rabbitmqConfig.queue}`);
    
    // Test connection (but don't fail if RabbitMQ is not running)
    rabbitmqConfig.connect().then(() => {
      console.log('✅ RabbitMQ connection successful');
      testApplication();
    }).catch((error) => {
      console.log('⚠️  RabbitMQ connection failed (this is optional):', error.message);
      testApplication();
    });
  } catch (error) {
    console.log('❌ RabbitMQ config failed:', error.message);
    testApplication();
  }
}

function testApplication() {
  console.log('\n6. Testing application initialization...');
  try {
    const Application = require('./src/app');
    const app = new Application();
    console.log('✅ Application class created');
    
    app.initialize().then(() => {
      console.log('✅ Application initialized successfully');
      console.log('\n🎉 All tests passed! The auth service should start normally.');
      process.exit(0);
    }).catch((error) => {
      console.log('❌ Application initialization failed:', error.message);
      console.log('Stack trace:', error.stack);
      process.exit(1);
    });
  } catch (error) {
    console.log('❌ Application creation failed:', error.message);
    console.log('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Handle unhandled errors
process.on('uncaughtException', (error) => {
  console.log('\n💥 Uncaught Exception:', error.message);
  console.log('Stack trace:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('\n💥 Unhandled Promise Rejection:', reason);
  process.exit(1);
}); 