# Quick Setup Script for Student ID System

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Student ID System - Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if qrcode is installed
Write-Host "Checking frontend dependencies..." -ForegroundColor Yellow
$packageJson = Get-Content "nguviu-frontend\package.json" | ConvertFrom-Json
if (-not $packageJson.dependencies.qrcode) {
    Write-Host "Installing qrcode package..." -ForegroundColor Yellow
    cd nguviu-frontend
    npm install qrcode
    cd ..
    Write-Host "✓ QR code package installed" -ForegroundColor Green
} else {
    Write-Host "✓ QR code package already installed" -ForegroundColor Green
}

# Check if .env has ID_CARD_SECRET
Write-Host "`nChecking backend environment..." -ForegroundColor Yellow
$envPath = "nguviu-backend\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    if ($envContent -match "ID_CARD_SECRET=") {
        Write-Host "✓ ID_CARD_SECRET found in .env" -ForegroundColor Green
    } else {
        Write-Host "⚠ ID_CARD_SECRET not found in .env" -ForegroundColor Yellow
        Write-Host "`nGenerating random secret..." -ForegroundColor Yellow
        
        # Generate random secret using Node.js
        $secret = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
        
        if ($secret) {
            Add-Content -Path $envPath -Value "`n# Student ID Card Security Secret"
            Add-Content -Path $envPath -Value "ID_CARD_SECRET=$secret"
            Write-Host "✓ Added ID_CARD_SECRET to .env" -ForegroundColor Green
            Write-Host "  Secret: $secret" -ForegroundColor Cyan
        } else {
            Write-Host "✗ Failed to generate secret. Add manually:" -ForegroundColor Red
            Write-Host "  ID_CARD_SECRET=your-64-character-hex-string" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "✗ .env file not found at: $envPath" -ForegroundColor Red
    Write-Host "  Create .env file and add:" -ForegroundColor Yellow
    Write-Host "  ID_CARD_SECRET=your-64-character-hex-string" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Start the backend server:" -ForegroundColor White
Write-Host "   cd nguviu-backend && npm start" -ForegroundColor Cyan

Write-Host "`n2. Start the frontend server:" -ForegroundColor White
Write-Host "   cd nguviu-frontend && npm run dev" -ForegroundColor Cyan

Write-Host "`n3. Login as admin and navigate to:" -ForegroundColor White
Write-Host "   http://localhost:5173/#/student-id-management" -ForegroundColor Cyan

Write-Host "`n4. Add a student and generate their QR code!" -ForegroundColor White

Write-Host "`n5. Read the full guide:" -ForegroundColor White
Write-Host "   STUDENT_ID_SYSTEM_GUIDE.md" -ForegroundColor Cyan

Write-Host "`n📱 Verification URL format:" -ForegroundColor Yellow
Write-Host "   http://localhost:5173/#/verify-student?t=TOKEN" -ForegroundColor Cyan

Write-Host ""
