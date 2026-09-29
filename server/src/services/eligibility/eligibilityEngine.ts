import { eq, and } from 'drizzle-orm';
import { db } from '../../db';
import {
  projects,
  teams,
  teamMembers,
  tracks,
  eventSettings,
  registrations,
  submissions,
} from '../../db/schema';

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
  evaluatedAt: string;
  projectId: string | null;
  teamId: string | null;
}

/**
 * Deterministically evaluate the eligibility of a project for judging.
 */
export async function evaluateProjectEligibility(projectId: string): Promise<EligibilityResult> {
  const evaluatedAt = new Date().toISOString();
  const reasons: string[] = [];

  // Fetch project with track, submissions, team and event
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    with: {
      track: true,
      submissions: true,
      team: {
        with: {
          members: {
            with: {
              user: {
                with: {
                  profile: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!project) {
    return {
      eligible: false,
      reasons: ['Project not found'],
      evaluatedAt,
      projectId,
      teamId: null,
    };
  }

  const team = project.team;
  if (!team) {
    return {
      eligible: false,
      reasons: ['Project is not linked to any team'],
      evaluatedAt,
      projectId,
      teamId: null,
    };
  }

  const teamId = team.id;
  const eventId = team.eventId;

  // 1. Fetch event settings for min/max team size and submission deadline
  const settings = await db.query.eventSettings.findFirst({
    where: eq(eventSettings.eventId, eventId),
  });

  const minTeamSize = settings?.minTeamSize ?? 1;
  const maxTeamSize = settings?.maxTeamSize ?? 4;
  const submissionDeadline = settings?.submissionDeadline;

  // 2. TEAM_SIZE_VALIDATION
  const members = team.members || [];
  const memberCount = members.length;

  if (memberCount < minTeamSize) {
    reasons.push(`Team has ${memberCount} members; minimum required is ${minTeamSize}`);
  } else if (memberCount > maxTeamSize) {
    reasons.push(`Team has ${memberCount} members; maximum allowed is ${maxTeamSize}`);
  }

  // 3. REGISTRATION_REQUIRED
  // Ensure every member has a record in registrations with completed_profile = true
  for (const member of members) {
    const reg = await db.query.registrations.findFirst({
      where: and(
        eq(registrations.userId, member.userId),
        eq(registrations.eventId, eventId)
      ),
    });

    const identifier = member.user?.profile?.fullName || member.user?.email || member.userId;

    if (!reg || !reg.completedProfile) {
      reasons.push(`Team member ${identifier} has incomplete event registration`);
    }
  }

  // 4. TRACK_SELECTION
  if (!project.trackId) {
    reasons.push('Project has not selected a valid track');
  } else {
    const track = await db.query.tracks.findFirst({
      where: and(eq(tracks.id, project.trackId), eq(tracks.eventId, eventId)),
    });
    if (!track) {
      reasons.push('Project has not selected a valid track');
    }
  }

  // 5. REQUIRED_FIELDS (title, description, repo_url)
  const missingFields: string[] = [];
  if (!project.title || project.title.trim().length === 0) {
    missingFields.push('title');
  }
  if (!project.description || project.description.trim().length === 0) {
    missingFields.push('description');
  }
  if (!project.repoUrl || project.repoUrl.trim().length === 0) {
    missingFields.push('repo_url');
  }

  if (missingFields.length > 0) {
    reasons.push(`Missing required project fields: ${missingFields.join(', ')}`);
  }

  // 6. FINAL_SUBMISSION_EXISTS (is_final = true and status = 'LOCKED')
  const finalSubmission = project.submissions.find(
    (s) => Boolean(s.isFinal) && s.status === 'LOCKED'
  );

  if (!finalSubmission) {
    reasons.push('Final submission was not submitted or locked');
  } else {
    // 7. DEADLINE_COMPLIANT
    if (submissionDeadline && finalSubmission.submittedAt) {
      const submittedAtTime = new Date(finalSubmission.submittedAt).getTime();
      const deadlineTime = new Date(submissionDeadline).getTime();
      if (submittedAtTime > deadlineTime) {
        reasons.push('Final submission was submitted after the deadline');
      }
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    evaluatedAt,
    projectId,
    teamId,
  };
}

/**
 * Deterministically evaluate the eligibility of a team.
 */
export async function evaluateTeamEligibility(teamId: string): Promise<EligibilityResult> {
  const evaluatedAt = new Date().toISOString();

  const team = await db.query.teams.findFirst({
    where: eq(teams.id, teamId),
    with: {
      projects: true,
    },
  });

  if (!team) {
    return {
      eligible: false,
      reasons: ['Team not found'],
      evaluatedAt,
      projectId: null,
      teamId,
    };
  }

  const project = team.projects[0];
  if (!project) {
    // Evaluate team size and registrations even without project
    const reasons: string[] = ['Team has not created a project'];

    const settings = await db.query.eventSettings.findFirst({
      where: eq(eventSettings.eventId, team.eventId),
    });
    const minTeamSize = settings?.minTeamSize ?? 1;
    const maxTeamSize = settings?.maxTeamSize ?? 4;

    const members = await db.query.teamMembers.findMany({
      where: eq(teamMembers.teamId, teamId),
      with: {
        user: {
          with: {
            profile: true,
          },
        },
      },
    });

    const memberCount = members.length;
    if (memberCount < minTeamSize) {
      reasons.push(`Team has ${memberCount} members; minimum required is ${minTeamSize}`);
    } else if (memberCount > maxTeamSize) {
      reasons.push(`Team has ${memberCount} members; maximum allowed is ${maxTeamSize}`);
    }

    for (const member of members) {
      const reg = await db.query.registrations.findFirst({
        where: and(
          eq(registrations.userId, member.userId),
          eq(registrations.eventId, team.eventId)
        ),
      });

      const identifier = member.user?.profile?.fullName || member.user?.email || member.userId;
      if (!reg || !reg.completedProfile) {
        reasons.push(`Team member ${identifier} has incomplete event registration`);
      }
    }

    reasons.push('Final submission was not submitted or locked');

    return {
      eligible: false,
      reasons,
      evaluatedAt,
      projectId: null,
      teamId,
    };
  }

  return evaluateProjectEligibility(project.id);
}

export interface EventEligibilityReportItem {
  teamId: string;
  teamName: string;
  captainEmail: string;
  track: string;
  memberCount: number;
  eligible: boolean;
  reasons: string[];
  projectId: string | null;
}

export interface EventEligibilityReport {
  eventId: string;
  evaluatedAt: string;
  totalTeams: number;
  eligibleCount: number;
  ineligibleCount: number;
  reports: EventEligibilityReportItem[];
}

/**
 * Generate full eligibility report for all teams and projects in an event.
 */
export async function generateEventEligibilityReport(eventId: string): Promise<EventEligibilityReport> {
  const evaluatedAt = new Date().toISOString();

  const eventTeams = await db.query.teams.findMany({
    where: eq(teams.eventId, eventId),
    with: {
      captain: true,
      projects: {
        with: {
          track: true,
        },
      },
      members: true,
    },
  });

  const reports: EventEligibilityReportItem[] = [];
  let eligibleCount = 0;

  for (const team of eventTeams) {
    const evalResult = await evaluateTeamEligibility(team.id);
    if (evalResult.eligible) {
      eligibleCount++;
    }

    const project = team.projects[0];
    const trackName = project?.track?.name || 'Unassigned';

    reports.push({
      teamId: team.id,
      teamName: team.name,
      captainEmail: team.captain?.email || '',
      track: trackName,
      memberCount: team.members?.length || 0,
      eligible: evalResult.eligible,
      reasons: evalResult.reasons,
      projectId: project ? project.id : null,
    });
  }

  return {
    eventId,
    evaluatedAt,
    totalTeams: eventTeams.length,
    eligibleCount,
    ineligibleCount: eventTeams.length - eligibleCount,
    reports,
  };
}

function escapeCsv(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Format eligibility report into downloadable RFC 4180 CSV string.
 */
export function formatEligibilityReportCsv(report: EventEligibilityReport): string {
  const headers = ['Team Name', 'Captain Email', 'Track', 'Member Count', 'Eligible', 'Reasons'];
  const rows = report.reports.map((item) => {
    return [
      escapeCsv(item.teamName),
      escapeCsv(item.captainEmail),
      escapeCsv(item.track),
      item.memberCount,
      item.eligible ? 'YES' : 'NO',
      escapeCsv(item.reasons.join('; ')),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
