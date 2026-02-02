# 📋 SEO Deployment Checklist for Render

Use this checklist when deploying to ensure your site is properly optimized for search engines.

## Pre-Deployment Checklist

- [ ] All SEO files created in `public/` folder:
  - [ ] sitemap.xml
  - [ ] robots.txt
  - [ ] schema.json
  
- [ ] Meta tags added to index.html:
  - [ ] Meta description
  - [ ] Meta keywords
  - [ ] Open Graph tags
  - [ ] Twitter Card tags
  - [ ] Canonical URL
  - [ ] Schema.org structured data

- [ ] Update placeholder information:
  - [ ] School contact information in schema.json
  - [ ] Social media links (if applicable)
  - [ ] School address and coordinates

## During Deployment to Render

- [ ] Deploy application to Render
- [ ] Note your Render URL: `_______________________`
- [ ] Verify deployment is successful
- [ ] Check that site loads properly

## Post-Deployment - Update Domain

- [ ] Run domain update script:
  ```powershell
  .\scripts\update-seo-domain.ps1 -Domain "your-app.onrender.com"
  ```
  
- [ ] Or manually update these files with your Render URL:
  - [ ] kangarufrontend/public/sitemap.xml
  - [ ] kangarufrontend/public/robots.txt
  - [ ] kangarufrontend/index.html

- [ ] Commit and push changes if updated manually
- [ ] Redeploy to Render (if needed)

## Verification Checklist

- [ ] Verify sitemap is accessible:
  - Visit: `https://your-app.onrender.com/sitemap.xml`
  - Should display XML sitemap with all URLs

- [ ] Verify robots.txt is accessible:
  - Visit: `https://your-app.onrender.com/robots.txt`
  - Should show search engine instructions

- [ ] Verify homepage loads:
  - Visit: `https://your-app.onrender.com/`
  - Check page title and meta tags in browser source

- [ ] Test key pages:
  - [ ] /about
  - [ ] /admissions
  - [ ] /contact
  - [ ] /events
  - [ ] /curriculum

- [ ] Check mobile responsiveness:
  - [ ] Open site on mobile device or use browser dev tools
  - [ ] Verify all pages display correctly

## Google Search Console Setup

- [ ] Go to https://search.google.com/search-console
- [ ] Click "Add Property"
- [ ] Enter your Render URL
- [ ] Choose verification method:
  - [ ] **Recommended**: HTML tag method
    - Copy the meta tag
    - Add to index.html in `<head>` section
    - Redeploy
    - Click "Verify" in Search Console
  - [ ] Or use HTML file upload
  - [ ] Or use Google Analytics method

- [ ] After verification, submit sitemap:
  - [ ] Navigate to "Sitemaps" in left menu
  - [ ] Enter: `sitemap.xml`
  - [ ] Click "Submit"
  - [ ] Verify status shows as "Success"

## Request Initial Indexing

- [ ] In Google Search Console, use URL Inspection tool:
  - [ ] Inspect homepage: `https://your-app.onrender.com/`
  - [ ] Click "Request Indexing"
  - [ ] Wait for confirmation

- [ ] Request indexing for important pages:
  - [ ] /about
  - [ ] /admissions
  - [ ] /contact
  - [ ] /events
  - [ ] /performance

## Bing Webmaster Tools (Optional)

- [ ] Go to https://www.bing.com/webmasters
- [ ] Add your site
- [ ] Verify ownership
- [ ] Submit sitemap URL

## Social Media Setup (Optional)

- [ ] Test Open Graph tags:
  - [ ] Share homepage link on Facebook
  - [ ] Verify correct image and description appear

- [ ] Test Twitter Cards:
  - [ ] Share homepage link on Twitter
  - [ ] Verify correct card appears

## Analytics Setup (Optional)

- [ ] Create Google Analytics 4 property
- [ ] Get Measurement ID (G-XXXXXXXXXX)
- [ ] Add Analytics script to index.html
- [ ] Verify tracking is working

## Final Verification (After 24 Hours)

- [ ] Check Google Search Console:
  - [ ] View "Coverage" report
  - [ ] Check for crawl errors
  - [ ] Verify pages are being indexed

- [ ] Test search visibility:
  - [ ] Google search: `site:your-app.onrender.com`
  - [ ] Verify pages appear in results (may take 1-4 weeks)

## Ongoing Maintenance

- [ ] Set reminder to check Search Console weekly
- [ ] Update sitemap when adding new pages
- [ ] Monitor for crawl errors
- [ ] Keep content fresh and updated
- [ ] Track search rankings for key terms:
  - School name
  - Location + "girls school"
  - "school admissions near me"

## Common Issues & Solutions

### Issue: Sitemap not found
- [ ] Verify file is in `public/` folder
- [ ] Check file name is exactly `sitemap.xml`
- [ ] Ensure file is included in Render deployment
- [ ] Check Render build logs

### Issue: Pages not indexing
- [ ] Wait at least 7-14 days after submission
- [ ] Check robots.txt isn't blocking
- [ ] Verify pages load without errors
- [ ] Request indexing again in Search Console

### Issue: Can't verify ownership
- [ ] Try HTML tag method (easiest)
- [ ] Ensure meta tag is in `<head>` section
- [ ] Redeploy after adding tag
- [ ] Wait a few minutes, then verify again

### Issue: Wrong domain in sitemap
- [ ] Run update-seo-domain.ps1 script again
- [ ] Or manually find/replace in files
- [ ] Commit and redeploy

## Notes & Timestamps

**Deployment Date**: ___________________

**Render URL**: ___________________

**Google Search Console Verified**: ___________________

**Sitemap Submitted**: ___________________

**First Index Date**: ___________________

**Analytics ID**: ___________________

---

## 🎯 Success Criteria

You've successfully completed SEO setup when:
- ✅ Sitemap and robots.txt are accessible
- ✅ Google Search Console is verified
- ✅ Sitemap is submitted and accepted
- ✅ Homepage indexing is requested
- ✅ No critical errors in Search Console

## 📊 Expected Timeline

- **Day 1**: Setup and submission complete
- **Days 2-7**: Google crawls your site
- **Weeks 2-4**: Pages start appearing in search
- **Weeks 4-12**: Rankings improve as Google understands your content

---

**Last Updated**: January 17, 2026
**Status**: Ready for deployment ✅
