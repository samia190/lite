# SEO Setup Validation Script
# Checks if all SEO files are properly configured before deployment

Write-Host ""
Write-Host "🔍 KANGARU GIRLS - SEO Setup Validation" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0
$projectRoot = Split-Path -Parent $PSScriptRoot

# Check if sitemap.xml exists
Write-Host "📄 Checking sitemap.xml..." -ForegroundColor Yellow
$sitemapPath = Join-Path $projectRoot "kangarufrontend\public\sitemap.xml"
if (Test-Path $sitemapPath) {
    Write-Host "   ✅ File exists" -ForegroundColor Green
    
    # Check if domain is updated
    $content = Get-Content $sitemapPath -Raw
    if ($content -match 'https://kangarugirlseniorschool.co.ke') {
        Write-Host "   ⚠️  WARNING: Domain not updated (still using placeholder)" -ForegroundColor Yellow
        $warnings++
    } else {
        Write-Host "   ✅ Domain appears to be updated" -ForegroundColor Green
    }
    
    # Check for required URLs
    $requiredPages = @('/', '/about', '/admissions', '/contact', '/events')
    foreach ($page in $requiredPages) {
        if ($content -match [regex]::Escape($page)) {
            Write-Host "   ✅ Contains $page" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Missing $page" -ForegroundColor Red
            $errors++
        }
    }
} else {
    Write-Host "   ❌ ERROR: sitemap.xml not found" -ForegroundColor Red
    $errors++
}

Write-Host ""

# Check if robots.txt exists
Write-Host "📄 Checking robots.txt..." -ForegroundColor Yellow
$robotsPath = Join-Path $projectRoot "kangarufrontend\public\robots.txt"
if (Test-Path $robotsPath) {
    Write-Host "   ✅ File exists" -ForegroundColor Green
    
    $content = Get-Content $robotsPath -Raw
    
    # Check if domain is updated
    if ($content -match 'https://kangarugirlseniorschool.co.ke') {
        Write-Host "   ⚠️  WARNING: Domain not updated (still using placeholder)" -ForegroundColor Yellow
        $warnings++
    } else {
        Write-Host "   ✅ Domain appears to be updated" -ForegroundColor Green
    }
    
    # Check for sitemap reference
    if ($content -match 'Sitemap:') {
        Write-Host "   ✅ Contains sitemap reference" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Missing sitemap reference" -ForegroundColor Red
        $errors++
    }
    
    # Check for admin disallow
    if ($content -match 'Disallow: /admin') {
        Write-Host "   ✅ Admin area is blocked" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  WARNING: Admin area not blocked" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "   ❌ ERROR: robots.txt not found" -ForegroundColor Red
    $errors++
}

Write-Host ""

# Check index.html for meta tags
Write-Host "📄 Checking index.html..." -ForegroundColor Yellow
$indexPath = Join-Path $projectRoot "kangarufrontend\index.html"
if (Test-Path $indexPath) {
    Write-Host "   ✅ File exists" -ForegroundColor Green
    
    $content = Get-Content $indexPath -Raw
    
    # Check for essential meta tags
    $metaTags = @{
        'description' = '<meta name="description"'
        'keywords' = '<meta name="keywords"'
        'og:title' = '<meta property="og:title"'
        'og:description' = '<meta property="og:description"'
        'twitter:card' = '<meta name="twitter:card"'
        'canonical' = '<link rel="canonical"'
        'schema.org' = '"@context": "https://schema.org"'
    }
    
    foreach ($tag in $metaTags.GetEnumerator()) {
        if ($content -match [regex]::Escape($tag.Value)) {
            Write-Host "   ✅ Has $($tag.Key) tag" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Missing $($tag.Key) tag" -ForegroundColor Red
            $errors++
        }
    }
    
    # Check if domain is updated
    if ($content -match 'https://kangarugirlseniorschool.co.ke') {
        Write-Host "   ⚠️  WARNING: Domain not updated in meta tags" -ForegroundColor Yellow
        $warnings++
    } else {
        Write-Host "   ✅ Domain appears to be updated in meta tags" -ForegroundColor Green
    }
} else {
    Write-Host "   ❌ ERROR: index.html not found" -ForegroundColor Red
    $errors++
}

Write-Host ""

# Check schema.json
Write-Host "📄 Checking schema.json..." -ForegroundColor Yellow
$schemaPath = Join-Path $projectRoot "kangarufrontend\public\schema.json"
if (Test-Path $schemaPath) {
    Write-Host "   ✅ File exists" -ForegroundColor Green
    
    $content = Get-Content $schemaPath -Raw
    
    # Check if it's valid JSON
    try {
        $json = $content | ConvertFrom-Json
        Write-Host "   ✅ Valid JSON format" -ForegroundColor Green
        
        # Check for required fields
        if ($json.'@context' -eq 'https://schema.org') {
            Write-Host "   ✅ Has Schema.org context" -ForegroundColor Green
        }
        
        if ($json.'@type' -eq 'EducationalOrganization') {
            Write-Host "   ✅ Correct organization type" -ForegroundColor Green
        }
        
        # Check if contact info is updated
        if ($json.telephone -eq '+XXX-XXX-XXXX') {
            Write-Host "   ⚠️  WARNING: Placeholder telephone number" -ForegroundColor Yellow
            $warnings++
        } else {
            Write-Host "   ✅ Telephone appears to be updated" -ForegroundColor Green
        }
        
    } catch {
        Write-Host "   ❌ ERROR: Invalid JSON format" -ForegroundColor Red
        $errors++
    }
} else {
    Write-Host "   ⚠️  WARNING: schema.json not found (optional file)" -ForegroundColor Yellow
    $warnings++
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "📊 Validation Summary" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "✨ Perfect! All SEO files are properly configured!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Deploy to Render" -ForegroundColor White
    Write-Host "2. Verify files are accessible" -ForegroundColor White
    Write-Host "3. Submit to Google Search Console" -ForegroundColor White
} elseif ($errors -eq 0) {
    Write-Host "✅ SEO setup is functional, but has $warnings warning(s)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Recommended actions:" -ForegroundColor Cyan
    Write-Host "1. Update domain using: .\scripts\update-seo-domain.ps1 -Domain 'your-app.onrender.com'" -ForegroundColor White
    Write-Host "2. Update contact information in schema.json" -ForegroundColor White
    Write-Host "3. Deploy to Render" -ForegroundColor White
} else {
    Write-Host "❌ Found $errors error(s) and $warnings warning(s)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the errors above before deploying." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "For detailed setup instructions, see:" -ForegroundColor Cyan
Write-Host "   - SEO_QUICK_START.md" -ForegroundColor White
Write-Host "   - SEO_SETUP_GUIDE.md" -ForegroundColor White
Write-Host "   - SEO_DEPLOYMENT_CHECKLIST.md" -ForegroundColor White
Write-Host ""

# Exit with error code if there are errors
if ($errors -gt 0) {
    exit 1
} else {
    exit 0
}
