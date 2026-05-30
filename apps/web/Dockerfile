# ============================================================
# BioWallet Web App — Multi-Stage Next.js Dockerfile
# ============================================================

# --------------- Stage 1: Build ---------------
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy root package files (monorepo root)
COPY package.json package-lock.json* yarn.lock* ./

# Copy workspace package.json files
COPY apps/web/package.json ./apps/web/
COPY packages/wallet-core/package.json ./packages/wallet-core/
COPY packages/biometric-core/package.json ./packages/biometric-core/
COPY packages/utils/package.json ./packages/utils/
COPY packages/shared-ui/package.json ./packages/shared-ui/

# Install dependencies
RUN npm install --ignore-scripts

# Copy all source code
COPY apps/web/ ./apps/web/
COPY packages/ ./packages/

# Set working directory to web app
WORKDIR /app/apps/web

# Build Next.js (generates .next/standalone output)
RUN npm run build

# --------------- Stage 2: Production ---------------
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

WORKDIR /app

# Set NODE_ENV
ENV NODE_ENV=production

# Copy standalone build output (includes all necessary deps)
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# Set ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose the web app port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

# Start Next.js standalone server
CMD ["node", "apps/web/server.js"]
