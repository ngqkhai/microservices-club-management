const axios = require('axios');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

// Health check configuration
const SERVICES = [
  { name: 'auth-service', url: 'http://localhost:3001/health' },
  { name: 'club-service', url: 'http://localhost:3002/health' },
  { name: 'event-service', url: 'http://localhost:3003/health' },
  { name: 'finance-service', url: 'http://localhost:3004/health' },
  { name: 'notify-service', url: 'http://localhost:3005/health' },
  { name: 'user-service', url: 'http://localhost:3006/health' },
  { name: 'frontend', url: 'http://localhost:3000' }
];

const TIMEOUT = 5000; // 5 seconds timeout

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function checkServiceHealth(service) {
  try {
    const response = await axios.get(service.url, {
      timeout: TIMEOUT,
      validateStatus: (status) => status < 500 // Accept any status < 500 as healthy
    });
    
    return {
      name: service.name,
      status: 'healthy',
      statusCode: response.status,
      responseTime: response.headers['x-response-time'] || 'N/A'
    };
  } catch (error) {
    return {
      name: service.name,
      status: 'unhealthy',
      error: error.message,
      code: error.code
    };
  }
}

async function checkPM2Status() {
  try {
    const { stdout } = await exec('pm2 jlist');
    const processes = JSON.parse(stdout);
    
    return processes.map(proc => ({
      name: proc.name,
      status: proc.pm2_env.status,
      uptime: proc.pm2_env.pm_uptime,
      restarts: proc.pm2_env.restart_time,
      memory: proc.monit.memory,
      cpu: proc.monit.cpu
    }));
  } catch (error) {
    return null;
  }
}

async function formatUptime(uptime) {
  if (!uptime) return 'N/A';
  
  const now = Date.now();
  const uptimeMs = now - uptime;
  const uptimeSeconds = Math.floor(uptimeMs / 1000);
  
  const days = Math.floor(uptimeSeconds / 86400);
  const hours = Math.floor((uptimeSeconds % 86400) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatMemory(bytes) {
  if (!bytes) return 'N/A';
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(1)}MB`;
}

async function runHealthCheck() {
  log(colors.blue, '🏥 Club Management System - Health Check');
  log(colors.blue, '=' .repeat(50));
  
  // Check PM2 status first
  log(colors.blue, '\n📊 PM2 Process Status:');
  const pm2Status = await checkPM2Status();
  
  if (!pm2Status) {
    log(colors.red, '❌ PM2 is not running or accessible');
    return;
  }
  
  // Display PM2 status
  for (const proc of pm2Status) {
    const statusColor = proc.status === 'online' ? colors.green : colors.red;
    const statusIcon = proc.status === 'online' ? '✅' : '❌';
    const uptime = await formatUptime(proc.uptime);
    
    log(statusColor, `${statusIcon} ${proc.name.padEnd(15)} | Status: ${proc.status.padEnd(8)} | Uptime: ${uptime.padEnd(10)} | Restarts: ${proc.restarts} | Memory: ${formatMemory(proc.memory)} | CPU: ${proc.cpu}%`);
  }
  
  // Check service health endpoints
  log(colors.blue, '\n🌐 Service Health Endpoints:');
  
  const healthChecks = await Promise.all(
    SERVICES.map(service => checkServiceHealth(service))
  );
  
  let healthyCount = 0;
  let totalCount = healthChecks.length;
  
  for (const check of healthChecks) {
    if (check.status === 'healthy') {
      healthyCount++;
      log(colors.green, `✅ ${check.name.padEnd(15)} | Status: ${check.statusCode} | Response Time: ${check.responseTime}`);
    } else {
      log(colors.red, `❌ ${check.name.padEnd(15)} | Error: ${check.error || check.code}`);
    }
  }
  
  // Summary
  log(colors.blue, '\n📈 Health Summary:');
  const healthPercentage = ((healthyCount / totalCount) * 100).toFixed(1);
  const summaryColor = healthyCount === totalCount ? colors.green : 
                      healthyCount > totalCount / 2 ? colors.yellow : colors.red;
  
  log(summaryColor, `${healthyCount}/${totalCount} services healthy (${healthPercentage}%)`);
  
  if (healthyCount === totalCount) {
    log(colors.green, '🎉 All services are running and healthy!');
  } else {
    log(colors.yellow, '⚠️  Some services need attention');
  }
  
  log(colors.blue, '\n💡 Management Commands:');
  log(colors.blue, '  npm run dev:status    - Check PM2 status');
  log(colors.blue, '  npm run dev:logs      - View all logs');
  log(colors.blue, '  npm run dev:restart   - Restart all services');
  log(colors.blue, '  npm run dev:monit     - Open monitoring dashboard');
}

// Handle command line arguments
const args = process.argv.slice(2);
const isWatchMode = args.includes('--watch') || args.includes('-w');
const interval = args.find(arg => arg.startsWith('--interval='))?.split('=')[1] || '30';

if (isWatchMode) {
  log(colors.blue, `🔄 Starting health check in watch mode (every ${interval}s)`);
  log(colors.blue, 'Press Ctrl+C to stop');
  
  // Run initial check
  runHealthCheck();
  
  // Set up interval
  setInterval(async () => {
    console.clear();
    await runHealthCheck();
  }, parseInt(interval) * 1000);
} else {
  // Run once
  runHealthCheck();
}

// Graceful shutdown
process.on('SIGINT', () => {
  log(colors.yellow, '\n👋 Health check stopped');
  process.exit(0);
});
