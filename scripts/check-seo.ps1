# SEO Setup Validation Script - Simple Version
# Checks if all SEO files are properly configured before deployment

Write-Host ""
Write-Host "SEO Setup Validation for NGUVIU GIRLS" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent $PSScriptRoot
$allGood = $true

# Check sitemap.xml
Write-Host "Checking sitemap.xml..." -ForegroundColor Yellow
$sitemapPath = Join-Path $projectRoot "nguviu-frontend\public\sitemap.xml"
if (Test-Path $sitemapPath) {
    Write-Host "  [OK] File exists" -ForegroundColor Green
    $content = Get-Content $sitemapPath -Raw
    if ($content -match 'https://your-domain\.com') {
        Write-Host "  [WARNING] Domain not updated (still using placeholder)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [ERROR] File not found" -ForegroundColor Red
    $allGood = $false
}

# Check robots.txt
Write-Host "Checking robots.txt..." -ForegroundColor Yellow
$robotsPath = Join-Path $projectRoot "nguviu-frontend\public\robots.txt"
if (Test-Path $robotsPath) {
    Write-Host "  [OK] File exists" -ForegroundColor Green
    $content = Get-Content $robotsPath -Raw
    if ($content -match 'https://your-domain\.com') {
        Write-Host "  [WARNING] Domain not updated (still using placeholder)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [ERROR] File not found" -ForegroundColor Red
    $allGood = $false
}

# Check index.html
Write-Host "Checking index.html meta tags..." -ForegroundColor Yellow
$indexPath = Join-Path $projectRoot "nguviu-frontend\index.html"
if (Test-Path $indexPath) {
    $content = Get-Content $indexPath -Raw
    
    if ($content -match '<meta name="description"') {
        Write-Host "  [OK] Has meta description" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] Missing meta description" -ForegroundColor Red
        $allGood = $false
    }
    
    if ($content -match 'og:title') {
        Write-Host "  [OK] Has Open Graph tags" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] Missing Open Graph tags" -ForegroundColor Red
        $allGood = $false
    }
    
    if ($content -match 'schema.org') {
        Write-Host "  [OK] Has structured data" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] Missing structured data" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "  [ERROR] index.html not found" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "Status: Ready for deployment!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Update domain: .\scripts\update-seo-domain.ps1 -Domain 'your-app.onrender.com'" -ForegroundColor White
    Write-Host "2. Deploy to Render" -ForegroundColor White
    Write-Host "3. Submit to Google Search Console" -ForegroundColor White
} else {
    Write-Host "Status: Errors found - please fix before deploying" -ForegroundColor Red
}
Write-Host ""
