# ============================================================
# BioWallet Backend — Multi-Stage Dockerfile
# ============================================================

# --------------- Stage 1: Build ---------------
FROM node:20-alpine AS builder

# Install deps for native modules (if any)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy root package files (monorepo root)
COPY package.json package-lock.json* yarn.lock* ./
COPY backend/api/package.json ./backend/api/
COPY backend/db/ ./backend/db/

# Install ALL dependencies (including devDependencies for build)
WORKDIR /app/backend/api
RUN npm install --ignore-scripts

# Copy source code
COPY backend/api/ ./backend/api/

# Generate Prisma client
RUN npx prisma generate --schema ../db/schema.prisma

# Compile TypeScript to JavaScript
RUN npx tsc --project tsconfig.json

# --------------- Stage 2: Production ---------------
FROM node:20-alpine AS runner

# Install tini for proper PID 1 signal handling
RUN apk add --no-cache tini

# Create non-root user
RUN addgroup -S nodejs && adduser -S appuser -G nodejs

WORKDIR /app

# Copy root package files for workspace resolution
COPY package.json package-lock.json* yarn.lock* ./
COPY backend/api/package.json ./backend/api/
COPY backend/db/ ./backend/db/

# Install production dependencies only
WORKDIR /app/backend/api
RUN npm install --omit=dev --ignore-scripts

# Generate Prisma client (production)
RUN npx prisma generate --schema ../db/schema.prisma

# Copy compiled JS from builder
COPY --from=builder /app/backend/api/dist ./dist

# Copy migration files for prisma migrate deploy
COPY --from=builder /app/backend/db/migrations ./../db/migrations

# Set ownership
RUN chown -R appuser:nodejs /app

# Switch to non-root user
USER appuser

# Expose the API port
EXPOSE 3001

# Environment
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

# Entrypoint with tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the server
CMD ["node", "dist/index.js"]
