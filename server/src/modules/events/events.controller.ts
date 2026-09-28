import { Request, Response } from 'express';
import { eventsService } from './events.service';
import {
  generateEventEligibilityReport,
  formatEligibilityReportCsv,
} from '../../services/eligibility';
import { logAuditEvent } from '../audit';
import { sendSuccess, sendError } from '../../utils/response';

export async function createEventHandler(req: Request, res: Response): Promise<void> {
  try {
    const event = await eventsService.createEvent(req.body);

    logAuditEvent({
      actorId: req.user?.id || null,
      action: 'EVENT_CREATED',
      entity: 'EVENT',
      entityId: event.id,
      metadata: { title: event.title, slug: event.slug },
      ipAddress: req.ip || req.socket.remoteAddress,
    }).catch(() => {});

    sendSuccess(res, { event }, { message: 'Event created successfully' }, 201);
  } catch (error: any) {
    if (error.statusCode === 409) {
      sendError(res, error.code || 'CONFLICT', error.message, null, 409);
      return;
    }
    throw error;
  }
}

export async function getEventsHandler(req: Request, res: Response): Promise<void> {
  const events = await eventsService.getEvents(req.user);
  sendSuccess(res, { events });
}

export async function getEventByIdHandler(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const event = await eventsService.getEventById(id, req.user);
  if (!event) {
    sendError(res, 'NOT_FOUND', 'Event not found', null, 404);
    return;
  }
  sendSuccess(res, { event });
}

export async function addTrackHandler(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  try {
    const track = await eventsService.addTrack(id, req.body);

    logAuditEvent({
      actorId: req.user?.id || null,
      action: 'TRACK_CREATED',
      entity: 'TRACK',
      entityId: track.id,
      metadata: { eventId: id, name: track.name },
      ipAddress: req.ip || req.socket.remoteAddress,
    }).catch(() => {});

    sendSuccess(res, { track }, { message: 'Track added successfully' }, 201);
  } catch (error: any) {
    if (error.statusCode === 404) {
      sendError(res, 'NOT_FOUND', error.message, null, 404);
      return;
    }
    throw error;
  }
}

export async function transitionPhaseHandler(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  try {
    const event = await eventsService.transitionPhase(id, req.body.phase);

    logAuditEvent({
      actorId: req.user?.id || null,
      action: 'EVENT_PHASE_CHANGED',
      entity: 'EVENT',
      entityId: id,
      metadata: { newPhase: req.body.phase, previousPhase: event.status },
      ipAddress: req.ip || req.socket.remoteAddress,
    }).catch(() => {});

    sendSuccess(res, { event }, { message: `Event phase updated to ${event.status}` });
  } catch (error: any) {
    if (error.statusCode === 400) {
      sendError(res, error.code || 'BAD_REQUEST', error.message, null, 400);
      return;
    }
    if (error.statusCode === 404) {
      sendError(res, 'NOT_FOUND', error.message, null, 404);
      return;
    }
    throw error;
  }
}

export async function getEventEligibilityReportHandler(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const format = req.query.format as string;

  const event = await eventsService.getEventById(id);
  if (!event) {
    sendError(res, 'NOT_FOUND', 'Event not found', null, 404);
    return;
  }

  const report = await generateEventEligibilityReport(id);

  if (format === 'csv') {
    const csvData = formatEligibilityReportCsv(report);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="eligibility-report-${id}.csv"`);
    res.status(200).send(csvData);
    return;
  }

  sendSuccess(res, report);
}
