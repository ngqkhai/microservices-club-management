# =============================================================================
# JWT RSA Key Pair Generator (PowerShell for Windows)
# =============================================================================
# Generates unique RSA key pairs for each environment (dev, prod)
# This ensures tokens from dev cannot be used in production
# =============================================================================

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

Write-Host "========================================" -ForegroundColor Green
Write-Host "   JWT RSA Key Pair Generator" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Create directories
$directories = @(
    "$ProjectRoot\secrets\development",
    "$ProjectRoot\secrets\production",
    "$ProjectRoot\services\auth\src\config\keys"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created directory: $dir" -ForegroundColor Yellow
    }
}

# Function to generate key pair
function Generate-KeyPair {
    param (
        [string]$Environment
    )
    
    $KeyDir = "$ProjectRoot\secrets\$Environment"
    $PrivateKeyPath = "$KeyDir\jwt_private.pem"
    $PublicKeyPath = "$KeyDir\jwt_public.pem"
    
    Write-Host "`nGenerating keys for: $Environment" -ForegroundColor Yellow
    
    # Check if keys already exist
    if ((Test-Path $PrivateKeyPath) -and (Test-Path $PublicKeyPath)) {
        $response = Read-Host "Keys already exist for $Environment. Overwrite? (y/N)"
        if ($response -ne 'y' -and $response -ne 'Y') {
            Write-Host "Skipping $Environment..."
            return
        }
    }
    
    # Check if OpenSSL is available
    $openssl = Get-Command openssl -ErrorAction SilentlyContinue
    if (!$openssl) {
        Write-Host "OpenSSL not found. Trying to use Git's OpenSSL..." -ForegroundColor Yellow
        $gitPath = (Get-Command git -ErrorAction SilentlyContinue).Source
        if ($gitPath) {
            $opensslPath = Join-Path (Split-Path (Split-Path $gitPath)) "usr\bin\openssl.exe"
            if (Test-Path $opensslPath) {
                $env:PATH = "$env:PATH;$(Split-Path $opensslPath)"
            }
        }
    }
    
    try {
        # Generate 2048-bit RSA private key
        & openssl genrsa -out $PrivateKeyPath 2048 2>$null
        
        # Extract public key from private key
        & openssl rsa -in $PrivateKeyPath -pubout -out $PublicKeyPath 2>$null
        
        Write-Host "✅ Generated keys for $Environment" -ForegroundColor Green
        Write-Host "   Private key: $PrivateKeyPath"
        Write-Host "   Public key:  $PublicKeyPath"
    }
    catch {
        Write-Host "❌ Failed to generate keys for $Environment" -ForegroundColor Red
        Write-Host "   Error: $_"
        Write-Host "   Make sure OpenSSL is installed and in PATH"
    }
}

# Generate keys for development
Generate-KeyPair -Environment "development"

# Generate keys for production
Generate-KeyPair -Environment "production"

# Copy development keys to auth service for local development
Write-Host "`nSetting up local development keys..." -ForegroundColor Yellow
Copy-Item "$ProjectRoot\secrets\development\jwt_private.pem" "$ProjectRoot\services\auth\src\config\keys\private.pem" -Force
Copy-Item "$ProjectRoot\secrets\development\jwt_public.pem" "$ProjectRoot\services\auth\src\config\keys\public.pem" -Force
Write-Host "✅ Copied development keys to auth service" -ForegroundColor Green

# Generate additional secrets
Write-Host "`nGenerating additional secrets..." -ForegroundColor Yellow

function Generate-RandomSecret {
    param ([int]$Length = 32)
    $bytes = New-Object byte[] $Length
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    return [Convert]::ToBase64String($bytes)
}

# Generate secrets for development
$apiSecretDev = Generate-RandomSecret -Length 32
$refreshSecretDev = Generate-RandomSecret -Length 48
$sessionSecretDev = Generate-RandomSecret -Length 32

Set-Content -Path "$ProjectRoot\secrets\development\api_gateway_secret.txt" -Value $apiSecretDev
Set-Content -Path "$ProjectRoot\secrets\development\refresh_token_secret.txt" -Value $refreshSecretDev
Set-Content -Path "$ProjectRoot\secrets\development\session_secret.txt" -Value $sessionSecretDev

# Generate secrets for production
$apiSecretProd = Generate-RandomSecret -Length 32
$refreshSecretProd = Generate-RandomSecret -Length 48
$sessionSecretProd = Generate-RandomSecret -Length 32

Set-Content -Path "$ProjectRoot\secrets\production\api_gateway_secret.txt" -Value $apiSecretProd
Set-Content -Path "$ProjectRoot\secrets\production\refresh_token_secret.txt" -Value $refreshSecretProd
Set-Content -Path "$ProjectRoot\secrets\production\session_secret.txt" -Value $sessionSecretProd

Write-Host "✅ Generated additional secrets" -ForegroundColor Green

# Create .gitignore in secrets directory
@"
# Never commit secrets to git!
*
!.gitignore
!README.md
"@ | Set-Content "$ProjectRoot\secrets\.gitignore"

# Create README for secrets directory
@"
# Secrets Directory

⚠️ **NEVER COMMIT THESE FILES TO GIT!**

This directory contains environment-specific secrets.

## Generating Keys

Run the generation script:
``````powershell
.\scripts\generate-jwt-keys.ps1
``````

## Security Notes

1. Production keys should ONLY exist on the production server
2. Never share private keys
3. Rotate keys periodically (every 90 days recommended)
4. Use different keys for each environment
"@ | Set-Content "$ProjectRoot\secrets\README.md"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Key Generation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Generated files:"
Write-Host "  - secrets/development/"
Write-Host "  - secrets/production/"
Write-Host "  - services/auth/src/config/keys/"
Write-Host ""
Write-Host "Remember: Never commit secrets to git!" -ForegroundColor Yellow
Write-Host "The secrets directory is already in .gitignore" -ForegroundColor Yellow
