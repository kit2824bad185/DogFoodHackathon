# Frontend API Contracts & Integration Guide

**Author:** Member 3 (Frontend + Product + UX Lead)  
**Status:** All Portals Integrated with Typed Frontend Services  
**Mode:** 100% Offline (Local Express API ➔ SQLite)

---

## 1. Backend Route Audit Summary

A strict audit of the actual backend implementation in `server/src` revealed that:
- **`GET /api/v1/health`** is the **ONLY** endpoint currently implemented by the backend (`server/src/routes/health.ts`).
- It tests SQLite connectivity via `db.run(sql`SELECT 1`)` and returns the system status, timestamp, database status (`connected`), and version.
- Previously documented `/api/v1/health/db` does not exist as a separate route in `server/src/routes/health.ts`.
- All domain entity endpoints (Auth, Events, Teams, Projects, Submissions, Eligibility, Judging, Results, Audit) are **PENDING** backend implementation in subsequent phases.
- The frontend has created fully typed service modules consolidating these contracts without mock data fabrication.

---

## 2. Implemented & Active Endpoints

| Endpoint | Method | Frontend Service | Request Shape | Response Shape | Auth Req | Role | Status |
| :--- | :---: | :--- | :--- | :--- | :---: | :---: | :---: |
| `/api/v1/health` | `GET` | `getHealth()` (`services/system.ts`) | `None` | `ApiResponse<HealthStatus>` | None | Public | ✅ **Active** |

### `GET /api/v1/health` Specification
- **Service Function:** `getHealth(): Promise<HealthStatus>` in `client/src/services/system.ts`
- **Request Body:** None
- **Query Parameters:** None
- **Response Format:**
  ```json
  {
    "data": {
      "status": "ok",
      "timestamp": "2026-09-28T07:49:19.905Z",
      "database": "connected",
      "version": "1.0.0"
    },
    "meta": {}
  }
  ```
- **Error Response (503):**
  ```json
  {
    "error": {
      "code": "HEALTH_CHECK_FAILED",
      "message": "Service is unhealthy",
      "details": null
    }
  }
  ```
- **Usage Across Portals:**
  - Connected in `Home.tsx` to indicate local API engine online status.
  - Connected in Public, Participant, Judge, and Organizer portals to verify connectivity and display truthful empty/unavailable states.

---

## 3. Pending Backend Endpoints & Frontend Services Matrix

All service functions listed below are implemented in `client/src/services/` with complete TypeScript interfaces matching the domain model. When invoked, if the backend route returns `404 Not Found`, the frontend gracefully displays existing empty and unavailable states without fallback mock data.

### A. Authentication & Session (`client/src/services/auth.ts`)

| Endpoint | Method | Frontend Service Function | Request Shape | Expected Response Shape | Auth | Role | Status |
| :--- | :---: | :--- | :--- | :--- | :---: | :---: | :---: |
| `/api/v1/auth/me` | `GET` | `getCurrentUser()` | None | `ApiResponse<User>` | Required | Any | ⏳ Pending Backend |
| `/api/v1/auth/login` | `POST` | `login(credentials)` | `LoginCredentials` (`{ email, password? }`) | `ApiResponse<AuthSession>` | None | Public | ⏳ Pending Backend |
| `/api/v1/auth/logout` | `POST` | `logout()` | None | `ApiResponse<void>` | Required | Any | ⏳ Pending Backend |

### B. Events & Announcements (`client/src/services/events.ts`)

| Endpoint | Method | Frontend Service Function | Request Shape | Expected Response Shape | Auth | Role | Status |
| :--- | :---: | :--- | :--- | :--- | :---: | :---: | :---: |
| `/api/v1/events` | `GET` | `getEvents()` | None | `ApiResponse<HackathonEvent[]>` | None | Public | ⏳ Pending Backend |
| `/api/v1/events/:slugOrId` | `GET` | `getEventBySlugOrId(slugOrId)` | None | `ApiResponse<HackathonEvent>` | None | Public | ⏳ Pending Backend |
| `/api/v1/events/:id` | `PATCH` | `updateEvent(id, updates)` | `UpdateEventRequest` (`{ name?, description?, status? }`) | `ApiResponse<HackathonEvent>` | Required | Organizer | ⏳ Pending Backend |
| `/api/v1/events/:id/announcements` | `GET` | `getEventAnnouncements(eventId)` | None | `ApiResponse<Announcement[]>` | None | Public | ⏳ Pending Backend |
| `/api/v1/announcements` | `POST` | `createAnnouncement(data)` | `CreateAnnouncementRequest` (`{ eventId, title, content, isPinned? }`) | `ApiResponse<Announcement>` | Required | Organizer | ⏳ Pending Backend |

### C. Teams & Registrations (`client/src/services/teams.ts`)

| Endpoint | Method | Frontend Service Function | Request Shape | Expected Response Shape | Auth | Role | Status |
| :--- | :---: | :--- | :--- | :--- | :---: | :---: | :---: |
| `/api/v1/events/:id/registration` | `GET` | `getMyRegistration(eventId)` | None | `ApiResponse<Registration>` | Required | Participant | ⏳ Pending Backend |
| `/api/v1/events/:id/registrations` | `GET` | `getEventRegistrations(eventId, params?)` | Query params: `{ search?, track?, status?, page?, limit? }` | `ApiResponse<Registration[]>` | Required | Organizer | ⏳ Pending Backend |
| `/api/v1/events/:id/teams/me` | `GET` | `getMyTeam(eventId)` | None | `ApiResponse<Team>` | Required | Participant | ⏳ Pending Backend |
| `/api/v1/events/:id/teams` | `GET` | `getEventTeams(eventId)` | None | `ApiResponse<Team[]>` | Required | Organizer | ⏳ Pending Backend |
| `/api/v1/events/:id/teams` | `POST` | `createTeam(eventId, data)` | `CreateTeamRequest` (`{ name }`) | `ApiResponse<Team>` | Required | Participant | ⏳ Pending Backend |
| `/api/v1/teams/join` | `POST` | `joinTeam(data)` | `JoinTeamRequest` (`{ joinCode }`) | `ApiResponse<Team>` | Required | Participant | ⏳ Pending Backend |
| `/api/v1/teams/:id/invitations` | `POST` | `inviteTeamMember(teamId, data)` | `InviteMemberRequest` (`{ email }`) | `ApiResponse<TeamInvitation>` | Required | Participant | ⏳ Pending Backend |

### D. Projects & Gallery (`client/src/services/projects.ts`)

| Endpoint | Method | Frontend Service Function | Request Shape | Expected Response Shape | Auth | Role | Status |
| :--- | :---: | :--- | :--- | :--- | :---: | :---: | :---: |
| `/api/v1/events/:slug/projects` | `GET` | `getPublicProjects(slug)` | None | `ApiResponse<Project[]>` | None | Public | ⏳ Pending Backend |
| `/api/v1/events/:slug/projects/:id` | `GET` | `getPublicProjectDetail(slug, id)` | None | `ApiResponse<Project>` | None | Public | ⏳ Pending Backend |
| `/api/v1/teams/:teamId/projects` | `GET` | `getTeamProjects(teamId)` | None | `ApiResponse<Project[]>` | Required | Participant | ⏳ Pending Backend |
| `/api/v1/teams/:teamId/projects` | `POST` | `createProject(teamId, data)` | `CreateProjectRequest` (`{ title, description, trackId, ... }`) | `ApiResponse<Project>` | Required | Participant | ⏳ Pending Backend |
| `/api/v1/projects/:projectId` | `PATCH` | `updateProject(projectId, data)` | `UpdateProjectRequest` | `ApiResponse<Project>` | Required | Participant | ⏳ Pending Backend |
| `/api/v1/events/:id/projects` | `GET` | `getOrganizerProjects(eventId)` | None | `ApiResponse<Project[]>` | Required | Organizer | ⏳ Pending Backend |

### E. Submissions & Eligibility (`client/src/services/submissions.ts`)

| Endpoint | Method | Frontend Service Function | Request Shape | Expected Response Shape | Auth | Role | Status |
| :--- | :---: | :--- | :--- | :--- | :---: | :---: | :---: |
| `/api/v1/projects/:id/submissions` | `POST` | `submitProject(projectId, data)` | `SubmitProjectRequest` (`{ trackId, notes? }`) | `ApiResponse<Submission>` | Required | Participant | ⏳ Pending Backend |
| `/api/v1/events/:id/submissions` | `GET` | `getOrganizerSubmissions(eventId)` | None | `ApiResponse<Submission[]>` | Required | Organizer | ⏳ Pending Backend |
| `/api/v1/submissions/:id/eligibility` | `GET` | `getSubmissionEligibility(submissionId)` | None | `ApiResponse<EligibilityReport>` | Required | Participant | ⏳ Pending Backend |
| `/api/v1/events/:id/eligibility` | `GET` | `getOrganizerEligibility(eventId)` | None | `ApiResponse<EligibilityReport[]>` | Required | Organizer | ⏳ Pending Backend |

### F. Judging & Rubrics (`client/src/services/judging.ts`)

| Endpoint | Method | Frontend Service Function | Request Shape | Expected Response Shape | Auth | Role | Status |
| :--- | :---: | :--- | :--- | :--- | :---: | :---: | :---: |
| `/api/v1/judges/me/assignments` | `GET` | `getMyAssignments()` | None | `ApiResponse<JudgeAssignment[]>` | Required | Judge | ⏳ Pending Backend |
| `/api/v1/assignments/:id` | `GET` | `getAssignmentDetail(assignmentId)` | None | `ApiResponse<AssignmentDetailResponse>` | Required | Judge | ⏳ Pending Backend |
| `/api/v1/assignments/:id/conflict` | `POST` | `declareConflict(assignmentId, data)` | `DeclareConflictRequest` (`{ reason }`) | `ApiResponse<ConflictDeclaration>` | Required | Judge | ⏳ Pending Backend |
| `/api/v1/judges/me/conflicts` | `GET` | `getMyConflicts()` | None | `ApiResponse<ConflictDeclaration[]>` | Required | Judge | ⏳ Pending Backend |
| `/api/v1/assignments/:id/scores` | `POST` | `submitScores(assignmentId, payload)` | `SubmitScoreRequest` (`{ isDraft, items, feedback? }`) | `ApiResponse<{ success, isLocked }>` | Required | Judge | ⏳ Pending Backend |
| `/api/v1/judges/me/history` | `GET` | `getMyEvaluationHistory()` | None | `ApiResponse<JudgeAssignment[]>` | Required | Judge | ⏳ Pending Backend |
| `/api/v1/events/:id/rubrics` | `GET` | `getRubrics(eventId)` | None | `ApiResponse<Rubric[]>` | Required | Organizer | ⏳ Pending Backend |
| `/api/v1/events/:id/judges` | `GET` | `getJudges(eventId)` | None | `ApiResponse<JudgeRosterItem[]>` | Required | Organizer | ⏳ Pending Backend |
| `/api/v1/events/:id/judges/assign` | `GET` | `getAssignmentsMatrix(eventId)` | None | `ApiResponse<unknown>` | Required | Organizer | ⏳ Pending Backend |
| `/api/v1/events/:id/judges/assign` | `POST` | `runAutoAssignment(eventId)` | None | `ApiResponse<{ success, assignmentsCount }>` | Required | Organizer | ⏳ Pending Backend |
| `/api/v1/conflicts/organizer` | `GET` | `getOrganizerConflicts()` | None | `ApiResponse<unknown[]>` | Required | Organizer | ⏳ Pending Backend |
| `/api/v1/scores/organizer` | `GET` | `getOrganizerScoresStream()` | None | `ApiResponse<unknown[]>` | Required | Organizer | ⏳ Pending Backend |

### G. Results, Awards, Certificates & Archive (`client/src/services/results.ts`)

| Endpoint | Method | Frontend Service Function | Request Shape | Expected Response Shape | Auth | Role | Status |
| :--- | :---: | :--- | :--- | :--- | :---: | :---: | :---: |
| `/api/v1/results` | `GET` | `getPublicResults()` | None | `ApiResponse<PublicResultsResponse>` | None | Public | ⏳ Pending Backend |
| `/api/v1/archive` | `GET` | `getPublicArchive()` | None | `ApiResponse<ArchiveRecord[]>` | None | Public | ⏳ Pending Backend |
| `/api/v1/events/:id/normalize` | `POST` | `runScoreNormalization(eventId)` | None | `ApiResponse<{ success, normalizedCount }>` | Required | Organizer | ⏳ Pending Backend |
| `/api/v1/events/:id/results` | `GET` | `getOrganizerResults(eventId)` | None | `ApiResponse<unknown>` | Required | Organizer | ⏳ Pending Backend |
| `/api/v1/events/:id/publish-results` | `POST` | `publishResults(eventId)` | None | `ApiResponse<{ success, publishedAt }>` | Required | Organizer | ⏳ Pending Backend |
| `/api/v1/events/:id/awards` | `GET` | `getAwards(eventId)` | None | `ApiResponse<AwardItem[]>` | Required | Organizer | ⏳ Pending Backend |
| `/api/v1/events/:id/certificates/me` | `GET` | `getMyCertificate(eventId)` | None | `ApiResponse<CertificateData>` | Required | Participant | ⏳ Pending Backend |
| `/api/v1/events/:id/certificates/organizer` | `GET` | `getOrganizerCertificates(eventId)` | None | `ApiResponse<CertificateData[]>` | Required | Organizer | ⏳ Pending Backend |
| `/api/v1/events/:id/certificates/generate` | `POST` | `generateCertificates(eventId)` | None | `ApiResponse<{ success, generatedCount }>` | Required | Organizer | ⏳ Pending Backend |
| `/api/v1/audit-logs` | `GET` | `getAuditLogs()` | None | `ApiResponse<AuditLogEntry[]>` | Required | Organizer | ⏳ Pending Backend |
| `/api/v1/events/:id/archive` | `GET` | `getOrganizerArchive(eventId)` | None | `ApiResponse<ArchiveRecord>` | Required | Organizer | ⏳ Pending Backend |
| `/api/v1/events/:id/archive/export` | `POST` | `exportArchive(eventId)` | None | Binary / Blob | Required | Organizer | ⏳ Pending Backend |

---

## 4. Privacy, Security & Offline Compliance

1. **Role Separation**:
   - Participant pages never request or render judge private notes, raw criteria scores, or conflicting submissions.
   - Judge pages only query for authenticated judge assignments (`/judges/me/*`) and never access peer judge evaluations.
   - Organizer pages access administrative overviews, aggregated statistics, and read-only audit trails.
   - Public pages only receive published events, approved project showcase cards, and formally published final leaderboards (`isPublished: true`).

2. **Mutation Safety**:
   - All mutation triggers disable action buttons during inflight requests.
   - Confirmation dialogs protect critical administrative operations (publishing results, triggering Z-score normalization).
   - Real backend feedback is reported via Toast notifications.

3. **100% Offline Architecture**:
   - Zero external CDNs, fonts, or third-party APIs.
   - All networking is bound strictly to `http://localhost:3000/api/v1`.
   - SQLite embedded local database with Drizzle ORM.
