# SSL Certificates Directory

⚠️ **Never commit private keys to git!**

## Structure

```
ssl/
├── certs/
│   ├── fullchain.pem    # Certificate + intermediate certs
│   └── privkey.pem      # Private key
└── generate-self-signed.ps1
```

## Development: Self-Signed Certificate

```powershell
.\ssl\generate-self-signed.ps1 -Domain localhost
```

## Production: Let's Encrypt

### Option 1: Certbot (Standalone)

```bash
# Stop Kong temporarily
docker-compose stop kong

# Get certificate
sudo certbot certonly --standalone \
  -d your-domain.com \
  --email admin@your-domain.com \
  --agree-tos

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/certs/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/certs/

# Restart Kong
docker-compose start kong
```

### Option 2: AWS Certificate Manager

If deploying to AWS, use ACM for free certificates:
- Create certificate in ACM
- Attach to Application Load Balancer
- ALB terminates SSL, forwards HTTP to Kong

## Certificate Renewal

Let's Encrypt certificates expire every 90 days. Set up auto-renewal:

```bash
# Add to crontab
0 0 1 * * certbot renew --quiet && docker-compose restart kong
```
