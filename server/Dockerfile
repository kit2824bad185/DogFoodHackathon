FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests first for maximum Docker layer caching
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Fast, clean, offline-preferring install
RUN npm ci --prefer-offline --no-audit --no-fund

# Copy server code and pre-seeded database
COPY server/ ./server/

# Compile TypeScript
WORKDIR /app/server
RUN npm run build

# Default command starts the compiled production server
CMD ["npm", "start"]

