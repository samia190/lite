# Multi-stage build for optimized production image
# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci && \
    npm cache clean --force

# Copy source files
COPY . .

# Build the application (optimized production build)
RUN npm run build

# Stage 2: Production image (much smaller)
FROM node:20-alpine AS production

WORKDIR /app

# Install serve globally for serving static files
RUN npm install -g serve@14.2.1 && \
    npm cache clean --force

# Copy built assets from builder stage
COPY --from=builder --chown=node:node /app/dist ./dist

# Use non-root user
USER node

# Expose port (Railway will override with $PORT)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/ || exit 1

# Serve static files (serve automatically uses $PORT environment variable)
CMD ["serve", "dist", "-n"]

