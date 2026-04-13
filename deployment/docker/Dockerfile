# Base image
FROM node:20-alpine

# Set working dir
WORKDIR /app

# Copy package files first (for caching)
COPY apps/api/package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy source code
COPY apps/api ./

# Expose port
EXPOSE 8080

# Start app
CMD ["node", "src/server.js"]