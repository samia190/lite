# Update SEO files with your actual domain
# Run this script after deployment to update all domain references

param(
    [Parameter(Mandatory=$true)]
    [string]$Domain
)

Write-Host "🔧 Updating SEO files with domain: $Domain" -ForegroundColor Cyan
Write-Host ""

# Remove trailing slash if present
$Domain = $Domain.TrimEnd('/')

# Ensure https:// prefix
if (-not $Domain.StartsWith('http')) {
    $Domain = "https://$Domain"
}

$files = @(
    "nguviu-frontend\public\sitemap.xml",
    "nguviu-frontend\public\robots.txt",
    "nguviu-frontend\index.html"
)

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    
    if (Test-Path $fullPath) {
        Write-Host "📝 Updating $file..." -ForegroundColor Yellow
        
        $content = Get-Content $fullPath -Raw
        $updated = $content -replace 'https://your-domain\.com', $Domain
        
        Set-Content -Path $fullPath -Value $updated -NoNewline
        
        Write-Host "   ✅ Updated successfully" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  File not found: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✨ Domain update complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Deploy your application to Render"
Write-Host "2. Verify sitemap is accessible: $Domain/sitemap.xml"
Write-Host "3. Verify robots.txt is accessible: $Domain/robots.txt"
Write-Host "4. Submit sitemap to Google Search Console"
Write-Host "5. Request indexing for your homepage"
Write-Host ""
Write-Host "📚 See SEO_SETUP_GUIDE.md for detailed instructions" -ForegroundColor Yellow
