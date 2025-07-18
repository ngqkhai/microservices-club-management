module.exports = {
  apps: [
    // Backend Microservices
    {
      name: 'auth-service',
      script: './services/auth/src/server.js',
      cwd: './services/auth',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
        HOST: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: '0.0.0.0'
      },
      watch: ['./services/auth/src'],
      ignore_watch: ['node_modules', 'logs', '*.log'],
      log_file: './logs/auth-service.log',
      error_file: './logs/auth-service-error.log',
      out_file: './logs/auth-service-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000
    },
    {
      name: 'club-service',
      script: './services/club/src/index.js',
      cwd: './services/club',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3002,
        HOST: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002,
        HOST: '0.0.0.0'
      },
      watch: ['./services/club/src'],
      ignore_watch: ['node_modules', 'logs', '*.log'],
      log_file: './logs/club-service.log',
      error_file: './logs/club-service-error.log',
      out_file: './logs/club-service-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000
    },
    {
      name: 'event-service',
      script: './services/event/src/index.js',
      cwd: './services/event',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3003,
        HOST: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3003,
        HOST: '0.0.0.0'
      },
      watch: ['./services/event/src'],
      ignore_watch: ['node_modules', 'logs', '*.log'],
      log_file: './logs/event-service.log',
      error_file: './logs/event-service-error.log',
      out_file: './logs/event-service-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000
    },
    {
      name: 'finance-service',
      script: './services/finance/src/index.js',
      cwd: './services/finance',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3004,
        HOST: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3004,
        HOST: '0.0.0.0'
      },
      watch: ['./services/finance/src'],
      ignore_watch: ['node_modules', 'logs', '*.log'],
      log_file: './logs/finance-service.log',
      error_file: './logs/finance-service-error.log',
      out_file: './logs/finance-service-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000
    },
    {
      name: 'notify-service',
      script: './services/notify/src/index.js',
      cwd: './services/notify',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3005,
        HOST: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3005,
        HOST: '0.0.0.0'
      },
      watch: ['./services/notify/src'],
      ignore_watch: ['node_modules', 'logs', '*.log'],
      log_file: './logs/notify-service.log',
      error_file: './logs/notify-service-error.log',
      out_file: './logs/notify-service-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000
    },
    {
      name: 'user-service',
      script: './services/user/src/index.js',
      cwd: './services/user',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3006,
        HOST: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3006,
        HOST: '0.0.0.0'
      },
      watch: ['./services/user/src'],
      ignore_watch: ['node_modules', 'logs', '*.log'],
      log_file: './logs/user-service.log',
      error_file: './logs/user-service-error.log',
      out_file: './logs/user-service-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000
    },
    // Frontend Application
    {
      name: 'frontend',
      script: 'npm',
      args: 'run dev',
      cwd: './new-frontend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      watch: false, // Next.js has its own hot reload
      log_file: './logs/frontend.log',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_restarts: 5,
      min_uptime: '10s',
      restart_delay: 4000,
      kill_timeout: 5000
    }
  ]
};
