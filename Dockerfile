# ========================================
# Stage 1: Install Dependencies
# ========================================
FROM node:lts-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# ========================================
# Stage 2: Build Application
# ========================================
FROM node:lts-alpine AS builder

WORKDIR /app

# Build arguments - NEXT_PUBLIC_* are baked into the build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_ENVIRONMENT=production

# Set environment variables for build
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}
ENV NEXT_PUBLIC_ENVIRONMENT=${NEXT_PUBLIC_ENVIRONMENT}
ENV NODE_ENV=production

# Copy dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build Next.js application (env vars are baked into static assets)
RUN npm run build

# ========================================
# Stage 3: Production Runtime
# ========================================
FROM node:lts-alpine AS runner

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Runtime environment
ENV NODE_ENV=production
ENV PORT=4000

# Copy built application from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy package.json for production dependencies reference
COPY package.json ./

# Install runtime dependencies only
RUN npm ci --omit=dev

# Set file ownership to nextjs user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "server.js"]
