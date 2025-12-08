# Novalyte MCP Services - Cloud Run Dockerfile
# Node.js 22 with TypeScript build

FROM node:22-slim

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source files
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies and source files (optional, for smaller image)
RUN rm -rf src tsconfig.json node_modules/@types

# Reinstall only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Expose port
EXPOSE 8080

# Set environment to production
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "dist/server.js"]

