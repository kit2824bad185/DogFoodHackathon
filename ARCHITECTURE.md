# Target Architecture: Dogfood 2026 Hackathon Platform

## 1. Overview
The platform will be built as a **Modular Monolith** prioritizing correctness, offline support, and judging integrity. The primary stack is:
- **Frontend**: TypeScript, React, Vite, accessible component system.
- **Backend**: Node.js REST API.
- **Database**: SQLite (local, single-file database to guarantee offline readiness without extra services).
- **ORM/Validation**: Drizzle ORM (or Prisma) combined with Zod for runtime validation.
- **Deployment**: Docker Compose for single-command `docker compose up` deployment.

## 2. Module Boundaries
The backend and frontend code will be logically separated into the following core modules:
- **Core Platform**: DB connections, Config, Webhooks, API Routing, Audit Logs.
- **Identity & Access**: Authentication, Session Management, Authorization/RBAC, Users.
- **Event Management**: Events, Tracks, Prizes, Registration.
- **Team & Project Management**: Teams, Invitations, Projects, Submissions, Eligibility.
- **Judging & Evaluation**: Judges, Assignments, Conflicts, Rubrics, Criteria, Scores, Normalization, Results.
- **Engagement**: Voting, Comments, Certificates.
- **Data Portability**: Imports, Exports, Archive.

## 3. Offline & Self-Hosting Strategy
- **No External Dependencies**: Zero reliance on cloud storage (e.g., S3), external databases, or Auth-as-a-Service (e.g., Auth0, Firebase).
- **Data Storage**: SQLite handles relational data. Local file system storage will be used for uploaded assets (images, documents).
- **Docker Compose**: Entire infrastructure (Node server, frontend proxy, local storage mount) spins up via `docker compose up`.
- **Pre-seeding**: Application includes a bootstrap CLI script to seed fixture/demo data automatically upon first start.

## 4. API Conventions
- **RESTful Endpoints**: Predictable routing (e.g., `GET /api/v1/events/:eventId/submissions`).
- **Standardized Responses**: 
  - Success: `{ "data": { ... }, "meta": { ... } }`
  - Error: `{ "error": { "code": "...", "message": "...", "details": [...] } }`
- **Validation**: All incoming requests validated by Zod schemas before hitting business logic.
- **Statelessness**: REST APIs remain stateless. Session tokens passed via headers or secure HTTP-only cookies.

## 5. Authentication & Session Strategy
- **Local Authentication**: Standard email/password with Argon2 hashing.
- **Session Management**: Secure HTTP-only cookies with signed JWTs (or opaque session tokens stored in SQLite).
- **No Third-Party OAuth**: While typical hackathons use GitHub/Google auth, the offline requirement dictates a standalone primary auth mechanism.

## 6. RBAC (Role-Based Access Control) Strategy
- **Strict Role Isolation**: Roles are `participant`, `judge`, `organizer`, `admin`.
- **Backend Enforced**: All routes middleware-protected. A judge cannot access another judge's assignments. 
- **Resource-Level Security**: Permissions check both the user's role and their relation to the resource (e.g., "is this judge assigned to this project?").

## 7. Audit-Event Strategy
- **Immutable Log**: Any state mutation (submission state change, score submission, user role change) writes an append-only record to the `audit_logs` table.
- **Context Tracked**: Includes `actor_id`, `action_type`, `resource_id`, `previous_state`, `new_state`, and `timestamp`.

## 8. Testing Strategy
- **Unit Tests**: Zod schemas, normalization algorithms, utility functions.
- **Integration Tests**: API endpoints using supertest with an in-memory or temporary SQLite database.
- **E2E Tests**: Cypress or Playwright tests for critical user journeys (Registration, Submissions, Judging).
- **Offline Verification**: CI must cut internet access during test execution to ensure offline capability.
