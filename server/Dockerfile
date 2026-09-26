FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

RUN npm install

COPY server/ ./server/

WORKDIR /app/server
RUN npm run build

# Default command
CMD ["npm", "start"]
