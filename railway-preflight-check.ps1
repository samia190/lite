#!/usr/bin/env pwsh
# Railway Deployment Pre-Flight Check
# Run this before deploying to Railway

Write-Host "`n🚀 Railway Deployment Pre-Flight Check`n" -ForegroundColor Cyan

$allPassed = $true

# Check 1: node_modules not in Git
Write-Host "✓ Checking .gitignore..." -NoNewline
$frontendGitignore = Get-Content "kangarufrontend\.gitignore" -ErrorAction SilentlyContinue
$backendGitignore = Get-Content "kangarubackend\.gitignore" -ErrorAction SilentlyContinue

if ($frontendGitignore -match "node_modules" -and $backendGitignore -match "node_modules") {
    Write-Host " ✅ PASS" -ForegroundColor Green
} else {
    Write-Host " ❌ FAIL - node_modules not in .gitignore" -ForegroundColor Red
    $allPassed = $false
}

# Check 2: Vite in dependencies (not devDependencies)
Write-Host "✓ Checking Vite location..." -NoNewline
$packageJson = Get-Content "kangarufrontend\package.json" | ConvertFrom-Json
if ($packageJson.dependencies.vite) {
    Write-Host " ✅ PASS (in dependencies)" -ForegroundColor Green
} else {
    Write-Host " ❌ FAIL - Vite should be in dependencies, not devDependencies" -ForegroundColor Red
    $allPassed = $false
}

# Check 3: Build script exists
Write-Host "✓ Checking build script..." -NoNewline
if ($packageJson.scripts.build) {
    Write-Host " ✅ PASS ($($packageJson.scripts.build))" -ForegroundColor Green
} else {
    Write-Host " ❌ FAIL - No build script found" -ForegroundColor Red
    $allPassed = $false
}

# Check 4: Start script exists
Write-Host "✓ Checking start script..." -NoNewline
if ($packageJson.scripts.start) {
    Write-Host " ✅ PASS ($($packageJson.scripts.start))" -ForegroundColor Green
} else {
    Write-Host " ❌ FAIL - No start script found" -ForegroundColor Red
    $allPassed = $false
}

# Check 5: Start script uses PORT variable
Write-Host "✓ Checking PORT variable usage..." -NoNewline
if ($packageJson.scripts.start -match '\$\{?PORT') {
    Write-Host " ✅ PASS" -ForegroundColor Green
} else {
    Write-Host " ⚠️  WARNING - Start script should use PORT variable" -ForegroundColor Yellow
}

# Check 6: Node engines specified
Write-Host "✓ Checking Node.js version..." -NoNewline
if ($packageJson.engines.node) {
    Write-Host " ✅ PASS ($($packageJson.engines.node))" -ForegroundColor Green
} else {
    Write-Host " ⚠️  WARNING - Consider adding 'engines' field" -ForegroundColor Yellow
}

# Check 7: Backend package.json
Write-Host "✓ Checking backend..." -NoNewline
$backendPackageJson = Get-Content "kangarubackend\package.json" | ConvertFrom-Json
if ($backendPackageJson.scripts.start) {
    Write-Host " ✅ PASS" -ForegroundColor Green
} else {
    Write-Host " ❌ FAIL - Backend missing start script" -ForegroundColor Red
    $allPassed = $false
}

# Check 8: Railway config files exist
Write-Host "✓ Checking Railway config..." -NoNewline
if ((Test-Path "kangarufrontend\railway.toml") -and (Test-Path "kangarubackend\railway.toml")) {
    Write-Host " ✅ PASS" -ForegroundColor Green
} else {
    Write-Host " ⚠️  WARNING - Railway config files missing (optional)" -ForegroundColor Yellow
}

# Check 9: Environment example files
Write-Host "✓ Checking .env.example files..." -NoNewline
if ((Test-Path "kangarufrontend\.env.example") -and (Test-Path "kangarubackend\.env.example")) {
    Write-Host " ✅ PASS" -ForegroundColor Green
} else {
    Write-Host " ⚠️  INFO - .env.example files recommended" -ForegroundColor Yellow
}

# Summary
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "✅ All critical checks passed! Ready to deploy to Railway." -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. Commit and push to GitHub"
    Write-Host "2. Create Railway project from GitHub repo"
    Write-Host "3. Set environment variables in Railway dashboard"
    Write-Host "4. Deploy!"
} else {
    Write-Host "❌ Some checks failed. Please fix the issues above before deploying." -ForegroundColor Red
}
Write-Host ("=" * 60) + "`n" -ForegroundColor Cyan

# Test production build (optional)
Write-Host "Would you like to test the production build locally? (y/n): " -NoNewline -ForegroundColor Yellow
$response = Read-Host

if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host "`nTesting frontend production build..." -ForegroundColor Cyan
    Push-Location kangarufrontend
    
    Write-Host "Running: npm ci --only=production" -ForegroundColor Gray
    npm ci --only=production
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Running: npm run build" -ForegroundColor Gray
        npm run build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Production build successful!" -ForegroundColor Green
            Write-Host "`nYou can test the production server with:" -ForegroundColor Cyan
            Write-Host "npm start" -ForegroundColor White
        } else {
            Write-Host "`n❌ Build failed. Check the errors above." -ForegroundColor Red
        }
    } else {
        Write-Host "`n❌ Dependency installation failed. Check the errors above." -ForegroundColor Red
    }
    
    Pop-Location
}

Write-Host ""
Write-Host "For documentation see RAILWAY.md and RAILWAY_TROUBLESHOOTING.md" -ForegroundColor Cyan
Write-Host ""
