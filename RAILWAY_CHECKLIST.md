# Railway Deployment Checklist

Use this checklist to ensure your KANGARU GIRLSSchool application is correctly configured for Railway deployment.

## Pre-Deployment

- [ ] GitHub repository is created and code is pushed
- [ ] MongoDB Atlas cluster is created (or plan to use Railway MongoDB plugin)
- [ ] Railway account is set up and ready
- [ ] **node_modules excluded from Git** (.gitignore configured)
- [ ] **Vite in dependencies** (NOT devDependencies) for frontend
- [ ] Run pre-flight check: `.\railway-preflight-check.ps1`

## Backend Service Setup

- [ ] Railway project created from GitHub repository
- [ ] Backend service root directory set to `kangarubackend`
- [ ] Environment variables configured:
  - [ ] `MONGO_URI` or `MONGODB_URI` (MongoDB connection string)
  - [ ] `JWT_SECRET` (random secret key)
  - [ ] `NODE_ENV=production`
  - [ ] `CORS_ORIGINS` (frontend Railway URL)
  - [ ] `PUBLIC_ORIGIN` (backend Railway URL or use `${{RAILWAY_PUBLIC_DOMAIN}}`)
- [ ] Public domain generated for backend
- [ ] Deployment successful (check logs)
- [ ] MongoDB connection confirmed (look for "✅ Connected to MongoDB" in logs)

## Frontend Service Setup

- [ ] Frontend service created in same Railway project
- [ ] Frontend service root directory set to `kangarufrontend`
- [ ] **Vite installed in dependencies** (check package.json)
- [ ] Environment variables configured:
  - [ ] `VITE_API_URL` (backend Railway URL from previous step)
  - [ ] `NODE_ENV=production`
- [ ] Build command: `npm run build`
- [ ] Start command: `npm start`
- [ ] Public domain generated for frontend
- [ ] Deployment successful (check build logs)

## MongoDB Configuration

### If using MongoDB Atlas:
- [ ] Database user created with proper permissions
- [ ] Network access allows connections from anywhere (0.0.0.0/0)
- [ ] Connection string copied to backend `MONGO_URI`
- [ ] Database name specified in connection string

### If using Railway MongoDB Plugin:
- [ ] MongoDB plugin added to Railway project
- [ ] `MONGO_URL` variable automatically available to backend
- [ ] Backend recognizes the connection (backend checks multiple env var names)

## Auto-Deploy Configuration

- [ ] Backend watch path: `kangarubackend/**`
- [ ] Frontend watch path: `kangarufrontend/**`
- [ ] Automatic deploys enabled on both services
- [ ] Test: Push a commit and verify auto-deployment triggers

## Post-Deployment Verification

- [ ] Backend health check responds: `https://your-backend.up.railway.app/api/health`
- [ ] Frontend loads without errors
- [ ] Login functionality works (tests MongoDB + JWT)
- [ ] No CORS errors in browser console
- [ ] File uploads work (if not using S3, files saved to backend disk)
- [ ] API requests complete successfully

## Optional Enhancements

- [ ] Custom domain configured for frontend
- [ ] Custom domain configured for backend
- [ ] AWS S3 configured for persistent file storage
  - [ ] `S3_BUCKET` set
  - [ ] `AWS_REGION` set
  - [ ] `AWS_ACCESS_KEY_ID` set
  - [ ] `AWS_SECRET_ACCESS_KEY` set
- [ ] Email service configured (if using contact forms)
- [ ] Error monitoring/logging set up

## Common Issues Troubleshooting

**"vite: not found" error:**
- ✅ FIXED: Vite moved to dependencies (not devDependencies)
- Verify in package.json: `"dependencies": { "vite": "^5.4.21" }`
- See [RAILWAY_TROUBLESHOOTING.md](./RAILWAY_TROUBLESHOOTING.md)

**Backend won't connect to MongoDB:**
- Verify `MONGO_URI` format: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
- Check Atlas IP whitelist includes 0.0.0.0/0
- Verify database user credentials are correct

**Frontend shows blank page:**
- Check browser console for errors
- Verify `VITE_API_URL` is set correctly
- Ensure build completed successfully (check Railway logs)

**CORS errors:**
- Update backend `CORS_ORIGINS` to include exact frontend URL
- Redeploy backend after changing CORS
- Don't include trailing slashes in URLs

**"Cannot find module" errors:**
- Check `package.json` dependencies are complete
- Verify `node_modules` installed correctly (check build logs)
- Ensure root directory is set correctly for each service

## Environment Variables Summary

### Backend Required:
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/kangaru
JWT_SECRET=your-random-secret-here
NODE_ENV=production
CORS_ORIGINS=https://your-frontend.up.railway.app
```

### Frontend Required:
```
VITE_API_URL=https://your-backend.up.railway.app
NODE_ENV=production
```

## Deployment Complete! 🎉

Once all items are checked, your application should be:
- ✅ Fully deployed on Railway
- ✅ Auto-deploying on every GitHub push
- ✅ Connected to MongoDB
- ✅ Accessible via public URLs

For detailed instructions, see [RAILWAY.md](./RAILWAY.md)
