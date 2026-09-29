import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// 1. Users
// ---------------------------------------------------------------------------
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', {
    enum: [
      'PARTICIPANT',
      'JUDGE',
      'ORGANIZER',
      'ADMIN',
      'participant',
      'judge',
      'organizer',
      'admin',
    ],
  })
    .default('PARTICIPANT')
    .notNull(),
  status: text('status', { enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] })
    .default('ACTIVE')
    .notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ---------------------------------------------------------------------------
// 2. Profiles
// ---------------------------------------------------------------------------
export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  bio: text('bio'),
  githubUrl: text('github_url'),
  linkedinUrl: text('linkedin_url'),
  skills: text('skills'),
  tShirtSize: text('t_shirt_size'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ---------------------------------------------------------------------------
// 3. Sessions
// ---------------------------------------------------------------------------
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ---------------------------------------------------------------------------
// 4. Events, Event Settings, Tracks
// ---------------------------------------------------------------------------
export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  status: text('status', {
    enum: [
      'DRAFT',
      'REGISTRATION_OPEN',
      'REGISTRATION_CLOSED',
      'SUBMISSION_OPEN',
      'SUBMISSION_CLOSED',
      'JUDGING',
      'RESULTS_REVIEW',
      'RESULTS_PUBLISHED',
      'ARCHIVED',
    ],
  })
    .default('DRAFT')
    .notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const eventSettings = sqliteTable('event_settings', {
  id: text('id').primaryKey(),
  eventId: text('event_id')
    .notNull()
    .unique()
    .references(() => events.id, { onDelete: 'cascade' }),
  minTeamSize: integer('min_team_size').default(1).notNull(),
  maxTeamSize: integer('max_team_size').default(4).notNull(),
  registrationDeadline: integer('registration_deadline', { mode: 'timestamp' }),
  submissionDeadline: integer('submission_deadline', { mode: 'timestamp' }),
});

export const tracks = sqliteTable('tracks', {
  id: text('id').primaryKey(),
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
});

// ---------------------------------------------------------------------------
// 5. Registrations, Teams, Team Members, Team Invites
// ---------------------------------------------------------------------------
export const registrations = sqliteTable('registrations', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  status: text('status').default('PENDING').notNull(),
  completedProfile: integer('completed_profile', { mode: 'boolean' })
    .default(false)
    .notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const teams = sqliteTable('teams', {
  id: text('id').primaryKey(),
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  joinCode: text('join_code').notNull().unique(),
  captainId: text('captain_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  isLocked: integer('is_locked', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const teamMembers = sqliteTable('team_members', {
  id: text('id').primaryKey(),
  teamId: text('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['CAPTAIN', 'MEMBER'] })
    .default('MEMBER')
    .notNull(),
  joinedAt: integer('joined_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const teamInvites = sqliteTable('team_invites', {
  id: text('id').primaryKey(),
  teamId: text('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  token: text('token').notNull().unique(),
  status: text('status', { enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED'] })
    .default('PENDING')
    .notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});

// ---------------------------------------------------------------------------
// 6. Projects, Submissions, Submission Versions
// ---------------------------------------------------------------------------
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  teamId: text('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  trackId: text('track_id').references(() => tracks.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  repoUrl: text('repo_url'),
  demoUrl: text('demo_url'),
  videoUrl: text('video_url'),
  techStack: text('tech_stack'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const submissions = sqliteTable('submissions', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  isFinal: integer('is_final', { mode: 'boolean' }).default(false).notNull(),
  status: text('status', { enum: ['DRAFT', 'SUBMITTED', 'LOCKED'] })
    .default('DRAFT')
    .notNull(),
  submittedAt: integer('submitted_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const submissionVersions = sqliteTable('submission_versions', {
  id: text('id').primaryKey(),
  submissionId: text('submission_id')
    .notNull()
    .references(() => submissions.id, { onDelete: 'cascade' }),
  versionNumber: integer('version_number').notNull(),
  payload: text('payload').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ---------------------------------------------------------------------------
// 7. Audit Logs
// ---------------------------------------------------------------------------
export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  actorId: text('actor_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  entity: text('entity').notNull(),
  entityId: text('entity_id'),
  metadata: text('metadata'),
  ipAddress: text('ip_address'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});
// ---------------------------------------------------------------------------
// Relations Definitions
// ---------------------------------------------------------------------------
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles),
  sessions: many(sessions),
  registrations: many(registrations),
  teamsCaptained: many(teams),
  teamMemberships: many(teamMembers),
  auditLogs: many(auditLogs),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  settings: one(eventSettings),
  tracks: many(tracks),
  registrations: many(registrations),
  teams: many(teams),
}));

export const eventSettingsRelations = relations(eventSettings, ({ one }) => ({
  event: one(events, {
    fields: [eventSettings.eventId],
    references: [events.id],
  }),
}));

export const tracksRelations = relations(tracks, ({ one, many }) => ({
  event: one(events, {
    fields: [tracks.eventId],
    references: [events.id],
  }),
  projects: many(projects),
}));

export const registrationsRelations = relations(registrations, ({ one }) => ({
  user: one(users, {
    fields: [registrations.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [registrations.eventId],
    references: [events.id],
  }),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  event: one(events, {
    fields: [teams.eventId],
    references: [events.id],
  }),
  captain: one(users, {
    fields: [teams.captainId],
    references: [users.id],
  }),
  members: many(teamMembers),
  invites: many(teamInvites),
  projects: many(projects),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));

export const teamInvitesRelations = relations(teamInvites, ({ one }) => ({
  team: one(teams, {
    fields: [teamInvites.teamId],
    references: [teams.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  team: one(teams, {
    fields: [projects.teamId],
    references: [teams.id],
  }),
  track: one(tracks, {
    fields: [projects.trackId],
    references: [tracks.id],
  }),
  submissions: many(submissions),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  project: one(projects, {
    fields: [submissions.projectId],
    references: [projects.id],
  }),
  versions: many(submissionVersions),
}));

export const submissionVersionsRelations = relations(submissionVersions, ({ one }) => ({
  submission: one(submissions, {
    fields: [submissionVersions.submissionId],
    references: [submissions.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, {
    fields: [auditLogs.actorId],
    references: [users.id],
  }),
}));

// ---------------------------------------------------------------------------
// Type Exports
// ---------------------------------------------------------------------------
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserRole =
  | 'PARTICIPANT'
  | 'JUDGE'
  | 'ORGANIZER'
  | 'ADMIN'
  | 'participant'
  | 'judge'
  | 'organizer'
  | 'admin';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type EventStatus =
  | 'DRAFT'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'SUBMISSION_OPEN'
  | 'SUBMISSION_CLOSED'
  | 'JUDGING'
  | 'RESULTS_REVIEW'
  | 'RESULTS_PUBLISHED'
  | 'ARCHIVED';

export type EventSettings = typeof eventSettings.$inferSelect;
export type NewEventSettings = typeof eventSettings.$inferInsert;

export type Track = typeof tracks.$inferSelect;
export type NewTrack = typeof tracks.$inferInsert;

export type Registration = typeof registrations.$inferSelect;
export type NewRegistration = typeof registrations.$inferInsert;

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;

export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type TeamMemberRole = 'CAPTAIN' | 'MEMBER';

export type TeamInvite = typeof teamInvites.$inferSelect;
export type NewTeamInvite = typeof teamInvites.$inferInsert;
export type TeamInviteStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
export type SubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'LOCKED';

export type SubmissionVersion = typeof submissionVersions.$inferSelect;
export type NewSubmissionVersion = typeof submissionVersions.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

// Member 2: Judging Module Tables
export * from './judging.schema';

