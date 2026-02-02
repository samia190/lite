# Docker Quick Reference

## 🚀 Quick Start

```bash
# 1. Copy environment file
cp .env.docker .env

# 2. Edit .env with your MongoDB URI and JWT secret
nano .env

# 3. Build and run
docker-compose up --build
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

---

## 📦 Individual Services

### Backend Only
```bash
cd kangarubackend
docker build -t kangarubackend .
docker run -p 4000:4000 \
  -e MONGO_URI=your-uri \
  -e JWT_SECRET=secret \
  -e NODE_ENV=production \
  kangarubackend
```

### Frontend Only
```bash
cd kangarufrontend
docker build -t kangarufrontend .
docker run -p 3000:3000 \
  -e VITE_API_URL=http://localhost:4000 \
  kangarufrontend
```

---

## 🔧 Common Commands

### Build
```bash
# Build both services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Force rebuild (no cache)
docker-compose build --no-cache
```

### Run
```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Start specific service
docker-compose up backend
```

### Stop
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop specific service
docker-compose stop backend
```

### Logs
```bash
# View all logs
docker-compose logs

# Follow logs (live)
docker-compose logs -f

# Logs for specific service
docker-compose logs backend
docker-compose logs frontend
```

### Debug
```bash
# Check running containers
docker ps

# Inspect container
docker inspect kangarubackend

# Execute command in container
docker exec -it kangarubackend sh

# Check image size
docker images | grep kangaru

# Check container stats
docker stats
```

---

## 🧹 Cleanup

### Remove containers
```bash
docker-compose down
```

### Remove images
```bash
docker rmi kangarubackend kangarufrontend
```

### Clean everything (Docker system)
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a
```

---

## 🐛 Troubleshooting

### "Port already in use"
```bash
# Find process using port 4000
lsof -i :4000
# Or on Windows:
netstat -ano | findstr :4000

# Stop docker-compose and try again
docker-compose down
docker-compose up
```

### "Cannot connect to MongoDB"
```bash
# Check .env file exists and has MONGO_URI
cat .env

# Test MongoDB connection from container
docker exec -it kangarubackend sh
# Inside container:
node -e "console.log(process.env.MONGO_URI)"
```

### "CORS error"
```bash
# Ensure CORS_ORIGINS includes frontend URL
docker exec -it kangarubackend sh
# Inside container:
node -e "console.log(process.env.CORS_ORIGINS)"
```

### "Module not found"
```bash
# Rebuild with no cache
docker-compose build --no-cache

# Check if package.json exists in image
docker run --rm kangarubackend ls -la
```

### Image size too large
```bash
# Check image size
docker images | grep kangaru

# Ensure .dockerignore excludes node_modules
cat kangarubackend/.dockerignore
cat kangarufrontend/.dockerignore

# Rebuild
docker-compose build --no-cache
```

---

## 📊 Expected Sizes

| Image | Expected Size | Status |
|-------|---------------|--------|
| kangarubackend | 250-350 MB | ✅ Optimized |
| kangarufrontend | 200-300 MB | ✅ Optimized |
| **Total** | **~500 MB** | ✅ Under Railway 4GB limit |

---

## 🎯 Health Checks

### Backend
```bash
curl http://localhost:4000/api/health
# Should return: {"ok":true,"time":"..."}
```

### Frontend
```bash
curl http://localhost:3000
# Should return HTML page
```

### Check in Docker
```bash
docker ps
# HEALTH column should show "healthy" after ~40 seconds
```

---

## 🚂 Railway Deployment

Railway will automatically use these Dockerfiles. Just ensure:

1. **Backend service**:
   - Root directory: `kangarubackend`
   - Env vars: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`

2. **Frontend service**:
   - Root directory: `kangarufrontend`
   - Env var: `VITE_API_URL=<backend-railway-url>`

Railway assigns `PORT` automatically - no need to set it!

---

## 📚 More Info

- Full guide: [DOCKER.md](./DOCKER.md)
- Railway guide: [RAILWAY.md](./RAILWAY.md)
- Deployment checklist: [RAILWAY_CHECKLIST.md](./RAILWAY_CHECKLIST.md)
