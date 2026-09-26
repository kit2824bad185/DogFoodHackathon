# Development Plan: Dogfood 2026 Hackathon Platform

## 1. Roadmap & Implementation Phases

**Phase 1: Setup & Foundation (Critical Path)**
- Initialize repository with Modular Monolith structure (Vite/React frontend, Node.js backend).
- Configure SQLite and Drizzle ORM/Prisma.
- Implement Docker Compose for local `docker compose up` flow.
- Setup test runner (Vitest/Jest) and ESLint/Prettier.
- Implement Core Platform module (routing, error handling, config).
- **Checkpoint**: Local environment runs seamlessly offline, DB migrations work.

**Phase 2: Core Workflows (T1 Completion Checkpoint)**
- **Identity & Access**: Implement Authentication (email/password) and RBAC middleware.
- **Event Management**: Create Events and Tracks (CRUD + State Machine).
- **Registration**: Implement user registration for events.
- **Teams**: Implement Team creation and Team Invitations.
- **Checkpoint**: Users can register, form teams, and organizers can manage events.

**Phase 3: Submissions & Projects (T1 Completion Checkpoint)**
- **Projects**: Implement project creation (title, description, tech stack, links).
- **Submissions**: Implement submission workflows (Draft -> Submitted) linking projects to tracks.
- **Eligibility**: Implement automated and manual eligibility checks.
- **Checkpoint**: Teams can submit their projects. System enforces deadlines.

**Phase 4: Judging Foundation (T2 Completion Checkpoint)**
- **Rubrics**: Implement Rubrics and Criteria.
- **Judges**: Implement Judge onboarding and status tracking.
- **Assignments**: Implement logic to assign Judges to Submissions (including COI).
- **Scoring**: Implement the scoring interface for Judges.
- **Checkpoint**: Judges can view assignments and submit scores.

**Phase 5: Normalization & Results (T2 Completion Checkpoint)**
- **Judge Statistics**: Compute mean and standard deviation per judge.
- **Normalization Engine**: Implement Z-score normalization for raw scores.
- **Results Aggregation**: Aggregate normalized scores and determine final rankings.
- **Audit Logs**: Ensure all judging actions are immutably logged.
- **Checkpoint**: Platform accurately determines and displays winners.

**Phase 6: Engagement (T3 Completion Checkpoint)**
- **Voting**: Implement participant voting with abuse prevention (rate limiting, IP/session checks).
- **Comments**: Enable commenting on submissions.
- **Checkpoint**: T3 features complete.

**Phase 7: Wrap-up & Polish (T4 Completion Checkpoint & Final Acceptance)**
- **Certificates**: Generate offline PDF certificates.
- **Archive**: Implement event archiving logic.
- **Data Portability**: Implement CSV imports/exports.
- **Offline Polish**: Ensure complete functionality with zero internet connectivity.
- **Final Checkpoint**: System is ready for production use.

## 2. Team Ownership Plan (Parallel Workflows)

The 4-person team will divide ownership by logical modules to minimize merge conflicts:

- **Member 1 (Platform & DevOps)**: Docker Compose setup, DB architecture (SQLite/ORM), CI/CD, Authentication, Audit Logs.
- **Member 2 (Event & User Workflows)**: Registration, Teams, Roles, Event State Machine, Frontend component system (React/Vite setup).
- **Member 3 (Submissions & Engagement)**: Projects, Submissions, Eligibility, Voting, Comments, Certificates.
- **Member 4 (Judging & Integrity)**: Rubrics, Assignments, Scoring UI, Normalization Engine, Results aggregation.

### Integration Points
- **API Contracts**: Team members must agree on Zod schemas for API payloads before implementing backend logic.
- **Database Schema**: All ORM schema changes must be reviewed by Member 1 to ensure relational integrity.

## 3. Risks & Mitigation
- **Offline Capability Failure**: Constant offline testing in CI to prevent accidental introduction of CDNs, Google Fonts, or external API dependencies.
- **Judging Anomalies**: Dedicated unit testing for the Normalization Engine with extensive fixture data to prove mathematical correctness.
- **State Machine Violations**: Strict Zod validation on state transitions to prevent arbitrary frontend state updates.
