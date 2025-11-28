#!/bin/bash
# =============================================================================
# JWT RSA Key Pair Generator
# =============================================================================
# Generates unique RSA key pairs for each environment (dev, prod)
# This ensures tokens from dev cannot be used in production
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   JWT RSA Key Pair Generator${NC}"
echo -e "${GREEN}========================================${NC}"

# Create directories
mkdir -p "$PROJECT_ROOT/secrets/development"
mkdir -p "$PROJECT_ROOT/secrets/production"
mkdir -p "$PROJECT_ROOT/services/auth/src/config/keys"

# Function to generate key pair
generate_keys() {
    local ENV=$1
    local KEY_DIR="$PROJECT_ROOT/secrets/$ENV"
    
    echo -e "\n${YELLOW}Generating keys for: $ENV${NC}"
    
    # Check if keys already exist
    if [ -f "$KEY_DIR/jwt_private.pem" ] && [ -f "$KEY_DIR/jwt_public.pem" ]; then
        echo -e "${YELLOW}Keys already exist for $ENV. Overwrite? (y/N)${NC}"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            echo "Skipping $ENV..."
            return
        fi
    fi
    
    # Generate 2048-bit RSA private key
    openssl genrsa -out "$KEY_DIR/jwt_private.pem" 2048 2>/dev/null
    
    # Extract public key from private key
    openssl rsa -in "$KEY_DIR/jwt_private.pem" -pubout -out "$KEY_DIR/jwt_public.pem" 2>/dev/null
    
    # Set secure permissions
    chmod 600 "$KEY_DIR/jwt_private.pem"
    chmod 644 "$KEY_DIR/jwt_public.pem"
    
    echo -e "${GREEN}✅ Generated keys for $ENV${NC}"
    echo "   Private key: $KEY_DIR/jwt_private.pem"
    echo "   Public key:  $KEY_DIR/jwt_public.pem"
}

# Generate keys for development
generate_keys "development"

# Generate keys for production
generate_keys "production"

# Copy development keys to auth service for local development
echo -e "\n${YELLOW}Setting up local development keys...${NC}"
cp "$PROJECT_ROOT/secrets/development/jwt_private.pem" "$PROJECT_ROOT/services/auth/src/config/keys/private.pem"
cp "$PROJECT_ROOT/secrets/development/jwt_public.pem" "$PROJECT_ROOT/services/auth/src/config/keys/public.pem"
echo -e "${GREEN}✅ Copied development keys to auth service${NC}"

# Generate other secrets
echo -e "\n${YELLOW}Generating additional secrets...${NC}"

# Generate API Gateway Secret
API_SECRET=$(openssl rand -base64 32)
echo "$API_SECRET" > "$PROJECT_ROOT/secrets/development/api_gateway_secret.txt"
API_SECRET_PROD=$(openssl rand -base64 32)
echo "$API_SECRET_PROD" > "$PROJECT_ROOT/secrets/production/api_gateway_secret.txt"

# Generate Refresh Token Secret
REFRESH_SECRET=$(openssl rand -base64 48)
echo "$REFRESH_SECRET" > "$PROJECT_ROOT/secrets/development/refresh_token_secret.txt"
REFRESH_SECRET_PROD=$(openssl rand -base64 48)
echo "$REFRESH_SECRET_PROD" > "$PROJECT_ROOT/secrets/production/refresh_token_secret.txt"

# Generate Session Secret
SESSION_SECRET=$(openssl rand -base64 32)
echo "$SESSION_SECRET" > "$PROJECT_ROOT/secrets/development/session_secret.txt"
SESSION_SECRET_PROD=$(openssl rand -base64 32)
echo "$SESSION_SECRET_PROD" > "$PROJECT_ROOT/secrets/production/session_secret.txt"

echo -e "${GREEN}✅ Generated additional secrets${NC}"

# Create .gitignore in secrets directory
cat > "$PROJECT_ROOT/secrets/.gitignore" << 'EOF'
# Never commit secrets to git!
*
!.gitignore
!README.md
EOF

# Create README for secrets directory
cat > "$PROJECT_ROOT/secrets/README.md" << 'EOF'
# Secrets Directory

⚠️ **NEVER COMMIT THESE FILES TO GIT!**

This directory contains environment-specific secrets:

```
secrets/
├── development/
│   ├── jwt_private.pem       # JWT signing key (dev)
│   ├── jwt_public.pem        # JWT verification key (dev)
│   ├── api_gateway_secret.txt
│   ├── refresh_token_secret.txt
│   └── session_secret.txt
├── production/
│   ├── jwt_private.pem       # JWT signing key (prod)
│   ├── jwt_public.pem        # JWT verification key (prod)
│   ├── api_gateway_secret.txt
│   ├── refresh_token_secret.txt
│   └── session_secret.txt
└── README.md
```

## Generating Keys

Run the generation script:
```bash
./scripts/generate-jwt-keys.sh
```

## Using with Docker Secrets

For Docker Swarm:
```bash
docker secret create jwt_private_key secrets/production/jwt_private.pem
docker secret create jwt_public_key secrets/production/jwt_public.pem
```

## Security Notes

1. Production keys should ONLY exist on the production server
2. Never share private keys
3. Rotate keys periodically (every 90 days recommended)
4. Use different keys for each environment
EOF

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}   Key Generation Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\nGenerated files:"
echo -e "  📁 secrets/development/"
echo -e "  📁 secrets/production/"
echo -e "  📁 services/auth/src/config/keys/"
echo -e "\n${YELLOW}⚠️  Remember: Never commit secrets to git!${NC}"
echo -e "${YELLOW}   The secrets/ directory is already in .gitignore${NC}"
