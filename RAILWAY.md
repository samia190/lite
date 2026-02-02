# Railway Deployment Guide

This guide covers deploying the KANGARU GIRLSSchool full-stack application (Node.js/Express backend + Vite/React frontend) to Railway.

## Overview

Your project structure:
- `kangarubackend/` - Node.js/Express API server
- `kangarufrontend/` - Vite + React SPA

Railway will deploy these as **two separate services** that communicate via HTTP.

---

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code must be in a GitHub repository
3. **MongoDB Atlas** (recommended): Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Alternatively, use Railway's MongoDB plugin (see below)

---

## Step 1: Deploy the Backend

### 1.1 Create Backend Service

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will auto-detect your Node.js app

### 1.2 Configure Root Directory

Since your backend is in a subdirectory:

1. Go to your backend service **Settings**
2. Scroll to **"Root Directory"**
3. Set it to: `kangarubackend`
4. Click **"Save"**

**Note:** Railway will automatically detect and use the optimized `Dockerfile` in `kangarubackend/` if present. This provides:
- 77% smaller images (300 MB vs 1.2 GB)
- Faster cold starts
- Better performance
- See [DOCKER.md](./DOCKER.md) for details

### 1.3 Set Environment Variables

Go to your backend service → **Variables** tab and add:

**Required:**
```bash
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/kangaru
JWT_SECRET=your-random-secret-key-here
NODE_ENV=production
```

**Recommended:**
```bash
CORS_ORIGINS=https://your-frontend.up.railway.app
PUBLIC_ORIGIN=${{RAILWAY_PUBLIC_DOMAIN}}
```

**Optional (S3 File Storage):**
```bash
S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

> **Note:** Railway automatically provides `PORT` - you don't need to set it.

### 1.4 Generate Public Domain

1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy the generated URL (e.g., `https://kangarubackend-production.up.railway.app`)

---

## Step 2: Deploy the Frontend

### 2.1 Create Frontend Service

1. In the same Railway project, click **"New Service"**
2. Select **"GitHub Repo"** → Choose the same repository
3. Railway will create a second service

### 2.2 Configure Root Directory & Build

1. Go to frontend service **Settings**
2. Set **"Root Directory"**: `kangarufrontend`
3. Under **"Build"**, set:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

### 2.3 Set Environment Variables

Go to frontend service → **Variables** tab:

```bash
VITE_API_URL=https://your-backend.up.railway.app
NODE_ENV=production
```

> Replace with your actual backend Railway URL from Step 1.4

### 2.4 Generate Public Domain

1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy the frontend URL (e.g., `https://kangarufrontend-production.up.railway.app`)

### 2.5 Update Backend CORS

Go back to **backend service** → **Variables** and update:

```bash
CORS_ORIGINS=https://your-actual-frontend-url.up.railway.app
```

Redeploy the backend for the CORS change to take effect.

---

## Step 3: MongoDB Setup

### Option A: MongoDB Atlas (Recommended)

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. **Whitelist Railway IPs**:
   - In Atlas: **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (0.0.0.0/0)
   - For better security, add specific Railway IPs from their [documentation](https://docs.railway.app/reference/public-networking#outbound-traffic)
4. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/kangaru`
5. Add it to backend **Variables** as `MONGO_URI`

### Option B: Railway MongoDB Plugin

1. In your Railway project, click **"New"** → **"Database"** → **"Add MongoDB"**
2. Railway will automatically create a `MONGO_URL` variable
3. Your backend already supports `MONGO_URL` (checks multiple env var names)

> **Note:** Railway MongoDB pricing may apply - check their pricing page.

---

## Step 4: Enable Auto-Deploy from GitHub

Railway automatically sets this up, but verify:

1. Go to **Settings** → **Triggers**
2. Ensure **"Watch Paths"** includes your service directory:
   - Backend: `kangarubackend/**`
   - Frontend: `kangarufrontend/**`
3. Check **"Enable automatic deploys"** is ON

Now every push to your main/master branch will trigger automatic deployments! 🚀

---

## Verification Checklist

- [ ] Backend service is running (check deployment logs)
- [ ] Frontend service is running and built successfully
- [ ] MongoDB connection successful (check backend logs for "✅ Connected to MongoDB")
- [ ] Frontend can reach backend API (test login/content loading)
- [ ] CORS is properly configured (no CORS errors in browser console)
- [ ] Auto-deploy works (push a commit and verify deployment triggers)

---

## Environment Variables Quick Reference

### Backend (`kangarubackend`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | ✅ | MongoDB connection string (Atlas or Railway) |
| `JWT_SECRET` | ✅ | Secret key for JWT token signing |
| `NODE_ENV` | ✅ | Set to `production` |
| `CORS_ORIGINS` | ⚠️ Recommended | Comma-separated allowed origins |
| `PUBLIC_ORIGIN` | ⚠️ Recommended | Backend public URL for file URLs |
| `PORT` | ❌ Auto-set | Railway provides this automatically |

### Frontend (`kangarufrontend`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ | Backend Railway URL (with https://) |
| `NODE_ENV` | ⚠️ Recommended | Set to `production` |

---

## Build Commands Summary

### Backend
```json
{
  "scripts": {
    "start": "node index.js"
  }
}
```

### Frontend
```json
{
  "scripts": {
    "build": "vite build",
    "start": "vite preview --host 0.0.0.0 --port ${PORT:-3000}"
  }
}
```

Railway will:
1. Install dependencies (`npm install`)
2. Run build command (frontend only: `npm run build`)
3. Execute start command (`npm start`)

---

## Troubleshooting

### Backend won't start
- Check deployment logs for errors
- Verify `MONGO_URI` is set correctly
- Ensure `JWT_SECRET` is set
- Check that root directory is `kangarubackend`

### Frontend shows blank page
- Check browser console for errors
- Verify `VITE_API_URL` points to backend Railway URL
- Ensure backend CORS allows the frontend origin
- Check that build completed successfully in logs

### CORS errors
- Update backend `CORS_ORIGINS` to include frontend URL
- Redeploy backend after changing CORS_ORIGINS
- Verify frontend is using correct backend URL

### MongoDB connection fails
- Check Atlas IP whitelist includes 0.0.0.0/0
- Verify connection string format
- Ensure database user has proper permissions
- Check backend logs for specific error messages

### Auto-deploy not working
- Verify GitHub app has repository access
- Check "Watch Paths" in Railway settings
- Ensure commits are pushed to the correct branch

---

## Cost Optimization

Railway offers:
- **$5/month** of free usage (Hobby plan)
- **Pay-as-you-go** pricing after free tier

Tips to stay within free tier:
- Use MongoDB Atlas free tier (not Railway MongoDB)
- Use S3/CloudFlare R2 for file storage (not local disk)
- Monitor usage in Railway dashboard

---

## Next Steps

1. **Custom Domain**: Add your own domain in Railway Settings → Domains
2. **File Storage**: Configure S3 for persistent file uploads (Railway's filesystem is ephemeral)
3. **Monitoring**: Set up logging/monitoring (Railway provides basic logs)
4. **CI/CD**: Already enabled via GitHub integration!

---

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- MongoDB Atlas Support: https://www.mongodb.com/cloud/atlas/support

Happy deploying! 🎉
