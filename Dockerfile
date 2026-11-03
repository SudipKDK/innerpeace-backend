# --- Stage 1: Builder ---
FROM node:24-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install ALL dependencies (including devDependencies for building)
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the NestJS application (outputs to dist/)
RUN npm run build

# --- Stage 2: Production Runner ---
FROM node:24-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

# Copy package files again
COPY package*.json ./

# Install ONLY production dependencies (keeps image small)
RUN npm ci --omit=dev && \
    npm cache clean --force

# Create and switch to a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy the built application from the builder stage
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]