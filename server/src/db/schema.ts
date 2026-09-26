import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table (just foundation for Phase 2)
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('participant'), // participant, judge, organizer, admin
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Audit Logs table (Foundation)
export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  actorId: text('actor_id'), // can be null for system actions
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  metadata: text('metadata'), // JSON string
  timestamp: text('timestamp').notNull().default(sql`CURRENT_TIMESTAMP`),
});
