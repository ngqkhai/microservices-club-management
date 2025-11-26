/**
 * Storage Module Index
 * 
 * Export all storage-related classes and utilities
 */

const StorageProvider = require('./StorageProvider');
const CloudinaryProvider = require('./CloudinaryProvider');
const MinioProvider = require('./MinioProvider');

module.exports = {
  StorageProvider,
  CloudinaryProvider,
  MinioProvider
};

