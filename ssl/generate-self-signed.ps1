# =============================================================================
# Generate Self-Signed SSL Certificate (Development Only)
# =============================================================================
# For production, use Let's Encrypt or AWS Certificate Manager
# =============================================================================

param(
    [string]$Domain = "localhost"
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$CertsDir = "$ScriptDir\certs"

Write-Host "========================================" -ForegroundColor Green
Write-Host "   Generate Self-Signed SSL Certificate" -ForegroundColor Green
Write-Host "   Domain: $Domain" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Create certs directory
if (!(Test-Path $CertsDir)) {
    New-Item -ItemType Directory -Path $CertsDir -Force | Out-Null
}

# Check for OpenSSL
$openssl = Get-Command openssl -ErrorAction SilentlyContinue
if (!$openssl) {
    # Try Git's OpenSSL
    $gitPath = (Get-Command git -ErrorAction SilentlyContinue).Source
    if ($gitPath) {
        $opensslPath = Join-Path (Split-Path (Split-Path $gitPath)) "usr\bin\openssl.exe"
        if (Test-Path $opensslPath) {
            $env:PATH = "$env:PATH;$(Split-Path $opensslPath)"
            Write-Host "Using OpenSSL from Git installation" -ForegroundColor Yellow
        }
    }
}

# Create OpenSSL config for SAN
$configContent = @"
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
x509_extensions = v3_req

[dn]
C = VN
ST = Ho Chi Minh
L = Ho Chi Minh City
O = Club Management Development
OU = Development
CN = $Domain

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = $Domain
DNS.2 = *.$Domain
DNS.3 = localhost
IP.1 = 127.0.0.1
"@

$configPath = "$CertsDir\openssl.cnf"
Set-Content -Path $configPath -Value $configContent

try {
    # Generate self-signed certificate
    & openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
        -keyout "$CertsDir\privkey.pem" `
        -out "$CertsDir\fullchain.pem" `
        -config $configPath

    Write-Host "`n✅ Certificate generated successfully!" -ForegroundColor Green
    Write-Host "`nFiles created:"
    Write-Host "   Certificate: $CertsDir\fullchain.pem"
    Write-Host "   Private Key: $CertsDir\privkey.pem"
    
    Write-Host "`n⚠️  This is a SELF-SIGNED certificate for DEVELOPMENT only!" -ForegroundColor Yellow
    Write-Host "   Browsers will show security warnings." -ForegroundColor Yellow
    Write-Host "   For production, use Let's Encrypt or a real CA." -ForegroundColor Yellow
}
catch {
    Write-Host "❌ Failed to generate certificate: $_" -ForegroundColor Red
    Write-Host "   Make sure OpenSSL is installed" -ForegroundColor Yellow
}
finally {
    # Cleanup config file
    if (Test-Path $configPath) {
        Remove-Item $configPath -Force
    }
}
