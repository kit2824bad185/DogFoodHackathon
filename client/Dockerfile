# Multi-stage build: Stage 1 for compiling the Vite React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests first for Docker layer caching
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Fast, clean, offline-preferring install
RUN npm ci --prefer-offline --no-audit --no-fund

# Copy client source code
COPY client/ ./client/

# Build static bundle
WORKDIR /app/client
RUN npm run build

# Stage 2: Minimal Nginx production image to serve static assets
FROM nginx:alpine
COPY --from=build /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

