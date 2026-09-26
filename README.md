# Dogfood 2026 Hackathon OS

A production-quality, self-hostable Hackathon Operating System.

## Architecture

- **Frontend**: TypeScript, React, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite with Drizzle ORM
- **Deployment**: Docker Compose

## Quick Start (Local Development)

The system is designed to be fully offline capable and runnable via Docker.

```bash
# Start the system
docker compose up -d --build

# Stop the system
docker compose down
```

## Running Locally Without Docker

If you prefer to run the services locally without Docker:

### 1. Start the Backend
```bash
cd server
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

### 2. Start the Frontend
```bash
cd client
npm install
npm run dev
```

## Testing

Run tests in the `server` directory:
```bash
cd server
npm test
```

## Data Seeding

The database is seeded automatically during `docker compose up` or via `npm run db:seed`. This adds foundational demo users and required starting states for testing.

## Offline Capability

This platform is strictly designed to work without internet connectivity. External services, CDNs, or cloud databases are not permitted.
