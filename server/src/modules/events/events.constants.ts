import { EventStatus } from '../../db/schema';

/**
 * Strict linear lifecycle phase order for hackathon events.
 */
export const EVENT_PHASE_SEQUENCE: readonly EventStatus[] = [
  'DRAFT',
  'REGISTRATION_OPEN',
  'REGISTRATION_CLOSED',
  'SUBMISSION_OPEN',
  'SUBMISSION_CLOSED',
  'JUDGING',
  'RESULTS_REVIEW',
  'RESULTS_PUBLISHED',
  'ARCHIVED',
] as const;

/**
 * Get the immediately following phase for an event.
 */
export function getNextEventPhase(currentPhase: EventStatus): EventStatus | null {
  const index = EVENT_PHASE_SEQUENCE.indexOf(currentPhase);
  if (index === -1 || index === EVENT_PHASE_SEQUENCE.length - 1) {
    return null; // Already at terminal state (ARCHIVED)
  }
  return EVENT_PHASE_SEQUENCE[index + 1];
}

/**
 * Validate that a proposed phase transition is strictly linear.
 */
export function validatePhaseTransition(
  currentPhase: EventStatus,
  targetPhase: EventStatus
): { valid: true } | { valid: false; message: string } {
  if (currentPhase === targetPhase) {
    return {
      valid: false,
      message: `Event is already in phase '${currentPhase}'.`,
    };
  }

  const nextAllowed = getNextEventPhase(currentPhase);

  if (!nextAllowed) {
    return {
      valid: false,
      message: `Event is in final terminal phase '${currentPhase}' and cannot be transitioned further.`,
    };
  }

  if (targetPhase !== nextAllowed) {
    return {
      valid: false,
      message: `Illegal phase transition from '${currentPhase}' to '${targetPhase}'. The next strictly valid phase is '${nextAllowed}'.`,
    };
  }

  return { valid: true };
}
