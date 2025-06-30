# Notification Service

A comprehensive microservice for handling all notification delivery in the Club Management System. This service processes email notifications via RabbitMQ message queues and supports multiple email types with beautiful, responsive templates.

## Features

- **Multi-Channel Support**: Email notifications with extensible architecture for SMS and Push notifications
- **Message Queue Integration**: RabbitMQ-based message consumption with retry logic and dead letter handling
- **Beautiful Email Templates**: Responsive HTML/text templates with Handlebars templating
- **Production Ready**: Comprehensive logging, health checks, monitoring, and graceful shutdown
- **Security First**: Rate limiting, input sanitization, CORS, and security headers
- **Highly Configurable**: Environment-based configuration with validation

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Auth Service  │    │  Event Service  │    │  Other Services │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │ Publish Events       │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                          ┌──────▼──────┐
                          │  RabbitMQ   │
                          │  Exchange   │
                          └──────┬──────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
              ┌─────▼─────┐ ┌────▼────┐ ┌─────▼─────┐
              │email.     │ │email.   │ │email.     │
              │verification│ │password.│ │rsvp       │
              │           │ │reset    │ │           │
              └─────┬─────┘ └────┬────┘ └─────┬─────┘
                    │            │            │
                    └────────────┼────────────┘
                                 │
                        ┌────────▼────────┐
                        │  Notification   │
                        │    Service      │
                        │                 │
                        │ ┌─────────────┐ │
                        │ │   Email     │ │
                        │ │  Service    │ │
                        │ └─────────────┘ │
                        └─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │  SMTP Server    │
                        │  (Gmail, etc.)  │
                        └─────────────────┘
```

## Supported Email Types

### 1. Email Verification
- **Queue**: `send.email.verification`
- **Purpose**: User registration email verification
- **Template**: Professional verification with security warnings

### 2. Password Reset
- **Queue**: `send.email.password.reset`
- **Purpose**: Password recovery emails
- **Template**: Security-focused with password tips

### 3. RSVP Invitations (Future)
- **Queue**: `send.email.rsvp`
- **Purpose**: Event invitations with RSVP buttons
- **Template**: Rich event details with interactive elements

### 4. Announcements (Future)
- **Queue**: `send.email.announcement`
- **Purpose**: Bulk announcements to members
- **Template**: Rich content with unsubscribe options

## Quick Start

### 1. Environment Setup

Copy the environment template:
```bash
cp .env.example .env
```

Configure your email settings in `.env`:
```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Club Management <your-email@gmail.com>

# RabbitMQ Configuration
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_EXCHANGE=club_events
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Service

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### 4. Health Check

Check if the service is running:
```bash
curl http://localhost:3005/health
```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment (development/production) | development | No |
| `PORT` | HTTP server port | 3005 | No |
| `HOST` | HTTP server host | 0.0.0.0 | No |
| `EMAIL_SERVICE` | Email service provider | gmail | Yes |
| `EMAIL_USER` | Email username | | Yes |
| `EMAIL_PASSWORD` | Email password/app password | | Yes |
| `EMAIL_FROM` | From email address | | Yes |
| `RABBITMQ_URL` | RabbitMQ connection URL | amqp://localhost:5672 | Yes |
| `LOG_LEVEL` | Logging level | info | No |
| `RATE_LIMIT_MAX_REQUESTS` | Rate limit per window | 100 | No |

### Email Provider Setup

#### Gmail Setup
1. Enable 2-factor authentication
2. Generate an App Password
3. Use your Gmail address as `EMAIL_USER`
4. Use the App Password as `EMAIL_PASSWORD`

#### Custom SMTP
```env
EMAIL_SERVICE=custom
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=notifications@yourdomain.com
EMAIL_PASSWORD=your-password
```

## Message Schemas

### Email Verification
```json
{
  "type": "send.email.verification",
  "userId": "user-uuid",
  "email": "user@example.com",
  "link": "https://app.com/verify/token",
  "fullName": "John Doe",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Password Reset
```json
{
  "type": "send.email.password.reset",
  "userId": "user-uuid",
  "email": "user@example.com", 
  "link": "https://app.com/reset/token",
  "fullName": "John Doe",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## API Endpoints

### Health Checks
- `GET /health` - Basic health status
- `GET /health/detailed` - Detailed component health
- `GET /health/readiness` - Kubernetes readiness probe
- `GET /health/liveness` - Kubernetes liveness probe
- `GET /health/stats` - Service statistics

### Admin Endpoints
- `POST /health/admin/consumers/restart` - Restart RabbitMQ consumers
- `POST /health/admin/stats/reset` - Reset statistics
- `POST /health/admin/templates/reload` - Reload email templates
- `POST /health/admin/email/test` - Send test email

## Development

### Running Tests
```bash
npm test
npm run test:watch
npm run test:coverage
```

### Linting
```bash
npm run lint
npm run lint:fix
```

### Template Development

Email templates are located in `src/templates/`:
```
src/templates/
├── email-verification/
│   ├── index.html        # HTML template
│   ├── index.txt         # Plain text template
│   └── meta.json         # Template metadata
└── password-reset/
    ├── index.html
    ├── index.txt
    └── meta.json
```

Template variables use Handlebars syntax:
```html
<h1>Hello {{fullName}}</h1>
<a href="{{verificationLink}}">Verify Email</a>
```

## Monitoring

### Logging

The service provides structured logging with multiple transports:
- Console (development)
- Rotating files (production)
- Error-specific logs
- Email operation logs

### Metrics

Key metrics available via `/health/stats`:
- Messages processed/failed
- Email delivery statistics
- Consumer health and uptime
- System resource usage

### Health Checks

Multiple health check endpoints for different monitoring needs:
- Basic health for load balancers
- Detailed health for monitoring systems
- Kubernetes-specific probes

## Deployment

### Docker (Future)
```bash
docker build -t notification-service .
docker run -p 3005:3005 --env-file .env notification-service
```

### Process Manager
```bash
# Using PM2
pm2 start src/server.js --name notification-service

# Using systemd
sudo systemctl start notification-service
```

## Troubleshooting

### Common Issues

1. **Email not sending**
   - Check email credentials in `.env`
   - Verify SMTP settings
   - Check firewall/security groups

2. **RabbitMQ connection failed**
   - Verify RabbitMQ is running
   - Check connection URL format
   - Verify network connectivity

3. **Templates not loading**
   - Check template file permissions
   - Verify template directory path
   - Check for syntax errors in templates

### Debug Mode

Enable debug logging:
```env
LOG_LEVEL=debug
NODE_ENV=development
```

### Testing Email Delivery

Send a test email:
```bash
curl -X POST http://localhost:3005/health/admin/email/test \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "type": "verification"}'
```

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all health checks pass

## Security

- All inputs are sanitized
- Rate limiting prevents abuse
- CORS configured for frontend access
- Security headers applied
- No sensitive data in logs

## License

MIT License - see LICENSE file for details 