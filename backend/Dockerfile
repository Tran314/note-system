# Backend Dockerfile - Optimized with multi-stage build
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy source
COPY . .

# Generate Prisma client and build
RUN npx prisma generate && npm run build

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

<<<<<<< Updated upstream
# Copy built files and dependencies
=======
# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy built files from builder
>>>>>>> Stashed changes
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

<<<<<<< Updated upstream
=======
# Set proper ownership
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

>>>>>>> Stashed changes
# Set environment
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

<<<<<<< Updated upstream
# Start application
CMD ["node", "dist/main.js"]
=======
# Start application with dumb-init for proper signal handling
CMD ["dumb-init", "node", "dist/main.js"]
>>>>>>> Stashed changes
