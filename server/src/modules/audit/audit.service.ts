import crypto from 'crypto';
import { eq, and, count, desc } from 'drizzle-orm';
import { db } from '../../db';
import { auditLogs, users } from '../../db/schema';
import { logger } from '../../config/logger';

export type AuditAction =
  | 'USER_LOGIN'
  | 'USER_REGISTERED'
  | 'PASSWORD_CHANGED'
  | 'USER_STATUS_UPDATED'
  | 'ROLE_ASSIGNED'
  | 'EVENT_CREATED'
  | 'EVENT_PHASE_CHANGED'
  | 'TRACK_CREATED'
  | 'TEAM_CREATED'
  | 'MEMBER_INVITED'
  | 'MEMBER_JOINED'
  | 'MEMBER_REMOVED'
  | 'TEAM_LOCKED'
  | 'PROJECT_CREATED'
  | 'PROJECT_UPDATED'
  | 'SUBMISSION_DRAFTED'
  | 'SUBMISSION_FINALIZED'
  | 'ELIGIBILITY_EVALUATED';

export type AuditEntity =
  | 'USER'
  | 'EVENT'
  | 'TRACK'
  | 'TEAM'
  | 'PROJECT'
  | 'SUBMISSION';

export interface LogAuditParams {
  actorId?: string | null;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string | null;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

export interface GetAuditLogsQuery {
  page?: number;
  limit?: number;
  action?: AuditAction;
  entity?: AuditEntity;
  actorId?: string;
}

/**
 * Insert an append-only audit event into the audit_logs table.
 * Designed to be non-blocking and safe against crashing caller workflows.
 */
export async function logAuditEvent(params: LogAuditParams): Promise<void> {
  try {
    const id = crypto.randomUUID();
    const now = new Date();
    const metadataStr = params.metadata ? JSON.stringify(params.metadata) : null;

    await db.insert(auditLogs).values({
      id,
      actorId: params.actorId || null,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId || null,
      metadata: metadataStr,
      ipAddress: params.ipAddress || null,
      createdAt: now,
    });
  } catch (error) {
    logger.warn({ error, params }, 'Failed to record audit log event');
  }
}

export class AuditService {
  /**
   * Fetch paginated audit logs with filtering by action, entity, or actorId.
   */
  async getAuditLogs(query: GetAuditLogsQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (query.action) {
      conditions.push(eq(auditLogs.action, query.action));
    }
    if (query.entity) {
      conditions.push(eq(auditLogs.entity, query.entity));
    }
    if (query.actorId) {
      conditions.push(eq(auditLogs.actorId, query.actorId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [countResult] = await db
      .select({ total: count() })
      .from(auditLogs)
      .where(whereClause);

    const total = countResult?.total || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // Fetch records ordered by createdAt DESC
    const records = await db.query.auditLogs.findMany({
      where: whereClause,
      with: {
        actor: {
          with: {
            profile: true,
          },
        },
      },
      orderBy: [desc(auditLogs.createdAt)],
      limit,
      offset,
    });

    // Sanitize actor info and parse metadata JSON
    const logs = records.map((record) => {
      let parsedMetadata: any = null;
      if (record.metadata) {
        try {
          parsedMetadata = JSON.parse(record.metadata);
        } catch {
          parsedMetadata = record.metadata;
        }
      }

      const actor = record.actor
        ? {
            id: record.actor.id,
            email: record.actor.email,
            role: record.actor.role,
            fullName: record.actor.profile?.fullName || null,
          }
        : null;

      return {
        id: record.id,
        action: record.action,
        entity: record.entity,
        entityId: record.entityId,
        metadata: parsedMetadata,
        ipAddress: record.ipAddress,
        createdAt: record.createdAt,
        actor,
      };
    });

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}

export const auditService = new AuditService();
