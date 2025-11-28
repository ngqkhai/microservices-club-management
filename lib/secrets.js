/**
 * =============================================================================
 * Docker Secrets Helper
 * =============================================================================
 * Reads secrets from Docker Secrets (/run/secrets/) or environment variables
 * Fails in production if required secrets are missing
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');

const SECRETS_PATH = '/run/secrets';

/**
 * Check if running in Docker with secrets mounted
 */
function hasDockerSecrets() {
  return fs.existsSync(SECRETS_PATH);
}

/**
 * Read a secret from Docker Secrets or environment variable
 * 
 * @param {string} name - The secret name (e.g., 'api_gateway_secret')
 * @param {Object} options - Options
 * @param {boolean} options.required - If true, throws error if missing in production
 * @param {string} options.envVar - Environment variable name to check (defaults to uppercase of name)
 * @param {string} options.envFileVar - Environment variable pointing to file path
 * @param {string} options.defaultValue - Default value (only used in non-production)
 * @returns {string|null} The secret value
 */
function getSecret(name, options = {}) {
  const {
    required = true,
    envVar = name.toUpperCase(),
    envFileVar = `${name.toUpperCase()}_FILE`,
    defaultValue = null
  } = options;

  const isProduction = process.env.NODE_ENV === 'production';

  // Priority 1: Docker Secrets path
  const secretPath = path.join(SECRETS_PATH, name);
  if (fs.existsSync(secretPath)) {
    try {
      return fs.readFileSync(secretPath, 'utf8').trim();
    } catch (err) {
      console.error(`Failed to read secret from ${secretPath}:`, err.message);
    }
  }

  // Priority 2: Environment variable pointing to file (e.g., API_GATEWAY_SECRET_FILE)
  const fileEnvValue = process.env[envFileVar];
  if (fileEnvValue && fs.existsSync(fileEnvValue)) {
    try {
      return fs.readFileSync(fileEnvValue, 'utf8').trim();
    } catch (err) {
      console.error(`Failed to read secret from ${fileEnvValue}:`, err.message);
    }
  }

  // Priority 3: Direct environment variable
  const envValue = process.env[envVar];
  if (envValue) {
    return envValue;
  }

  // Priority 4: Default value (only in non-production)
  if (!isProduction && defaultValue !== null) {
    console.warn(`⚠️  Using default value for ${name} (development only)`);
    return defaultValue;
  }

  // If required and missing in production, fail fast
  if (required && isProduction) {
    console.error(`❌ FATAL: Required secret '${name}' is not configured`);
    console.error(`   Set one of:`);
    console.error(`   - Docker secret: ${secretPath}`);
    console.error(`   - Environment variable: ${envVar}`);
    console.error(`   - File path variable: ${envFileVar}`);
    process.exit(1);
  }

  if (required) {
    console.warn(`⚠️  Missing secret: ${name}`);
  }

  return null;
}

/**
 * Read JWT private key from secrets or file
 */
function getJwtPrivateKey() {
  // Try Docker secret first
  const secretPath = path.join(SECRETS_PATH, 'jwt_private_key');
  if (fs.existsSync(secretPath)) {
    return fs.readFileSync(secretPath, 'utf8');
  }

  // Try file path from environment
  const keyPath = process.env.JWT_PRIVATE_KEY_FILE || 
                  process.env.JWT_PRIVATE_KEY_PATH ||
                  './src/config/keys/private.pem';
  
  if (fs.existsSync(keyPath)) {
    return fs.readFileSync(keyPath, 'utf8');
  }

  // Try inline environment variable
  if (process.env.JWT_PRIVATE_KEY) {
    return process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n');
  }

  if (process.env.NODE_ENV === 'production') {
    console.error('❌ FATAL: JWT private key not found');
    process.exit(1);
  }

  console.warn('⚠️  JWT private key not found, some features may not work');
  return null;
}

/**
 * Read JWT public key from secrets or file
 */
function getJwtPublicKey() {
  // Try Docker secret first
  const secretPath = path.join(SECRETS_PATH, 'jwt_public_key');
  if (fs.existsSync(secretPath)) {
    return fs.readFileSync(secretPath, 'utf8');
  }

  // Try file path from environment
  const keyPath = process.env.JWT_PUBLIC_KEY_FILE || 
                  process.env.JWT_PUBLIC_KEY_PATH ||
                  './src/config/keys/public.pem';
  
  if (fs.existsSync(keyPath)) {
    return fs.readFileSync(keyPath, 'utf8');
  }

  // Try inline environment variable
  if (process.env.JWT_PUBLIC_KEY) {
    return process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n');
  }

  // Try JWT_RSA_PUBLIC_KEY (Kong format)
  if (process.env.JWT_RSA_PUBLIC_KEY) {
    return process.env.JWT_RSA_PUBLIC_KEY.replace(/\\n/g, '\n');
  }

  if (process.env.NODE_ENV === 'production') {
    console.error('❌ FATAL: JWT public key not found');
    process.exit(1);
  }

  console.warn('⚠️  JWT public key not found, some features may not work');
  return null;
}

/**
 * Get database connection URL from secrets
 */
function getDatabaseUrl(type = 'postgres') {
  const secretName = type === 'postgres' ? 'database_url' : 'mongodb_uri';
  const envVar = type === 'postgres' ? 'DATABASE_URL' : 'MONGODB_URI';
  
  return getSecret(secretName, {
    envVar,
    required: true,
    defaultValue: type === 'postgres' 
      ? 'postgresql://postgres:postgres_local_dev@localhost:5432/auth_service_db'
      : 'mongodb://mongo:mongo_local_dev@localhost:27017/club_db?authSource=admin'
  });
}

/**
 * Get all secrets as an object
 */
function getAllSecrets() {
  return {
    apiGatewaySecret: getSecret('api_gateway_secret', {
      defaultValue: 'local-dev-api-gateway-secret-min-16'
    }),
    refreshTokenSecret: getSecret('refresh_token_secret', {
      defaultValue: 'local-dev-refresh-secret-minimum-32-characters-long'
    }),
    sessionSecret: getSecret('session_secret', {
      defaultValue: 'local-dev-session-secret-min-32-chars'
    }),
    jwtPrivateKey: getJwtPrivateKey(),
    jwtPublicKey: getJwtPublicKey(),
  };
}

/**
 * Validate all required secrets are present
 */
function validateSecrets(requiredSecrets = []) {
  const isProduction = process.env.NODE_ENV === 'production';
  const missing = [];

  for (const secret of requiredSecrets) {
    const value = getSecret(secret, { required: false });
    if (!value) {
      missing.push(secret);
    }
  }

  if (missing.length > 0) {
    if (isProduction) {
      console.error('❌ FATAL: Missing required secrets:');
      missing.forEach(s => console.error(`   - ${s}`));
      process.exit(1);
    } else {
      console.warn('⚠️  Missing secrets (using defaults in development):');
      missing.forEach(s => console.warn(`   - ${s}`));
    }
  }

  return missing.length === 0;
}

module.exports = {
  getSecret,
  getJwtPrivateKey,
  getJwtPublicKey,
  getDatabaseUrl,
  getAllSecrets,
  validateSecrets,
  hasDockerSecrets
};
