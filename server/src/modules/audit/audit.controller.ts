import { Request, Response } from 'express';
import { auditService } from './audit.service';
import { sendSuccess } from '../../utils/response';

export async function getAuditLogsHandler(req: Request, res: Response): Promise<void> {
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
  const action = req.query.action as any;
  const entity = req.query.entity as any;
  const actorId = req.query.actorId as string;

  const result = await auditService.getAuditLogs({
    page,
    limit,
    action,
    entity,
    actorId,
  });

  sendSuccess(res, { logs: result.logs }, result.pagination);
}
