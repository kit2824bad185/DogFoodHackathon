import crypto from 'crypto';
import { eq, and, count } from 'drizzle-orm';
import { db } from '../../db';
import {
  teams,
  teamMembers,
  teamInvites,
  events,
  eventSettings,
  registrations,
  Team,
  TeamMember,
} from '../../db/schema';
import { CreateTeamInput, InviteMemberInput, JoinTeamInput } from './teams.schemas';

function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export class TeamsService {
  /**
   * Create a new team with the current user as captain.
   */
  async createTeam(userId: string, data: CreateTeamInput): Promise<any> {
    // 1. Verify event exists and is in REGISTRATION_OPEN
    const event = await db.query.events.findFirst({
      where: eq(events.id, data.eventId),
    });

    if (!event) {
      const error: any = new Error('Event not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    if (event.status !== 'REGISTRATION_OPEN') {
      const error: any = new Error(
        `Teams can only be formed while registration is open. Current status: ${event.status}`
      );
      error.code = 'REGISTRATION_CLOSED';
      error.statusCode = 400;
      throw error;
    }

    // 2. Ensure user is registered for the event
    const userReg = await db.query.registrations.findFirst({
      where: and(
        eq(registrations.userId, userId),
        eq(registrations.eventId, data.eventId)
      ),
    });

    if (!userReg) {
      // Auto-register user for the event
      await db.insert(registrations).values({
        id: crypto.randomUUID(),
        userId,
        eventId: data.eventId,
        status: 'CONFIRMED',
        completedProfile: true,
        createdAt: new Date(),
      });
    }

    // 3. Verify user is not already in a team for this event
    const existingMembership = await db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(and(eq(teamMembers.userId, userId), eq(teams.eventId, data.eventId)));

    if (existingMembership.length > 0) {
      const error: any = new Error('You are already a member of a team in this event');
      error.code = 'CONFLICT';
      error.statusCode = 409;
      throw error;
    }

    // 4. Generate unique join code
    let joinCode = generateJoinCode();
    let collision = await db.query.teams.findFirst({ where: eq(teams.joinCode, joinCode) });
    while (collision) {
      joinCode = generateJoinCode();
      collision = await db.query.teams.findFirst({ where: eq(teams.joinCode, joinCode) });
    }

    const teamId = crypto.randomUUID();
    const memberId = crypto.randomUUID();
    const now = new Date();

    const [newTeam] = await db
      .insert(teams)
      .values({
        id: teamId,
        eventId: data.eventId,
        name: data.name,
        joinCode,
        captainId: userId,
        isLocked: false,
        createdAt: now,
      })
      .returning();

    await db.insert(teamMembers).values({
      id: memberId,
      teamId,
      userId,
      role: 'CAPTAIN',
      joinedAt: now,
    });

    return this.getTeamById(teamId);
  }

  /**
   * Team captain creates an invite token.
   */
  async inviteMember(userId: string, teamId: string, data: InviteMemberInput): Promise<any> {
    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
    });

    if (!team) {
      const error: any = new Error('Team not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    if (team.captainId !== userId) {
      const error: any = new Error('Only the team captain can invite members');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    if (team.isLocked) {
      const error: any = new Error('Cannot invite members to a locked team');
      error.code = 'BAD_REQUEST';
      error.statusCode = 400;
      throw error;
    }

    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    const [invite] = await db
      .insert(teamInvites)
      .values({
        id: crypto.randomUUID(),
        teamId,
        email: data.email,
        token,
        status: 'PENDING',
        expiresAt,
      })
      .returning();

    return {
      inviteId: invite.id,
      token,
      email: data.email,
      expiresAt,
      teamId,
    };
  }

  /**
   * User joins a team using a joinCode or invite token.
   */
  async joinTeam(userId: string, data: JoinTeamInput): Promise<any> {
    let team: Team | undefined;
    let inviteIdToUpdate: string | undefined;

    const code = data.joinCode || data.join_code;

    if (code) {
      team = await db.query.teams.findFirst({
        where: eq(teams.joinCode, code.toUpperCase()),
      });
    } else if (data.token) {
      const invite = await db.query.teamInvites.findFirst({
        where: and(eq(teamInvites.token, data.token), eq(teamInvites.status, 'PENDING')),
      });

      if (!invite) {
        const error: any = new Error('Invalid or already used invite token');
        error.code = 'NOT_FOUND';
        error.statusCode = 404;
        throw error;
      }

      if (new Date() > new Date(invite.expiresAt)) {
        await db
          .update(teamInvites)
          .set({ status: 'EXPIRED' })
          .where(eq(teamInvites.id, invite.id));
        const error: any = new Error('Invite token has expired');
        error.code = 'EXPIRED';
        error.statusCode = 400;
        throw error;
      }

      team = await db.query.teams.findFirst({
        where: eq(teams.id, invite.teamId),
      });
      inviteIdToUpdate = invite.id;
    }

    if (!team) {
      const error: any = new Error('Team not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    if (team.isLocked) {
      const error: any = new Error('This team is locked and cannot accept new members');
      error.code = 'TEAM_LOCKED';
      error.statusCode = 400;
      throw error;
    }

    // Verify event is in registration open
    const event = await db.query.events.findFirst({
      where: eq(events.id, team.eventId),
    });

    if (!event || event.status !== 'REGISTRATION_OPEN') {
      const error: any = new Error('Team joining is only permitted while event registration is open');
      error.code = 'REGISTRATION_CLOSED';
      error.statusCode = 400;
      throw error;
    }

    // Check if user is already in a team for this event
    const existingMembership = await db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(and(eq(teamMembers.userId, userId), eq(teams.eventId, team.eventId)));

    if (existingMembership.length > 0) {
      if (existingMembership[0].teamId === team.id) {
        return this.getTeamById(team.id); // already in this team
      }
      const error: any = new Error('You are already a member of a team in this event');
      error.code = 'CONFLICT';
      error.statusCode = 409;
      throw error;
    }

    // Enforce max team size
    const settings = await db.query.eventSettings.findFirst({
      where: eq(eventSettings.eventId, team.eventId),
    });
    const maxTeamSize = settings?.maxTeamSize ?? 4;

    const [memberCountResult] = await db
      .select({ count: count() })
      .from(teamMembers)
      .where(eq(teamMembers.teamId, team.id));

    const currentCount = memberCountResult?.count || 0;
    if (currentCount >= maxTeamSize) {
      const error: any = new Error(
        `Team has reached its maximum size of ${maxTeamSize} members`
      );
      error.code = 'TEAM_FULL';
      error.statusCode = 400;
      throw error;
    }

    // Auto-register user for the event if not registered
    const userReg = await db.query.registrations.findFirst({
      where: and(eq(registrations.userId, userId), eq(registrations.eventId, team.eventId)),
    });
    if (!userReg) {
      await db.insert(registrations).values({
        id: crypto.randomUUID(),
        userId,
        eventId: team.eventId,
        status: 'CONFIRMED',
        completedProfile: true,
        createdAt: new Date(),
      });
    }

    // Add user as MEMBER
    await db.insert(teamMembers).values({
      id: crypto.randomUUID(),
      teamId: team.id,
      userId,
      role: 'MEMBER',
      joinedAt: new Date(),
    });

    if (inviteIdToUpdate) {
      await db
        .update(teamInvites)
        .set({ status: 'ACCEPTED' })
        .where(eq(teamInvites.id, inviteIdToUpdate));
    }

    return this.getTeamById(team.id);
  }

  /**
   * Remove member or leave team.
   */
  async removeMember(currentUserId: string, teamId: string, targetUserId: string): Promise<any> {
    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
    });

    if (!team) {
      const error: any = new Error('Team not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    if (team.isLocked) {
      const error: any = new Error('Cannot modify members of a locked team');
      error.code = 'TEAM_LOCKED';
      error.statusCode = 400;
      throw error;
    }

    const membership = await db.query.teamMembers.findFirst({
      where: and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, targetUserId)),
    });

    if (!membership) {
      const error: any = new Error('Member not found in this team');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    const isCaptain = team.captainId === currentUserId;
    const isSelf = currentUserId === targetUserId;

    if (!isCaptain && !isSelf) {
      const error: any = new Error('You do not have permission to remove this member');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    // If captain is leaving
    if (targetUserId === team.captainId) {
      const otherMembers = await db.query.teamMembers.findMany({
        where: and(eq(teamMembers.teamId, teamId), eq(teamMembers.role, 'MEMBER')),
      });

      if (otherMembers.length > 0) {
        // Transfer captaincy to the first member
        const newCaptain = otherMembers[0];
        await db.update(teams).set({ captainId: newCaptain.userId }).where(eq(teams.id, teamId));
        await db
          .update(teamMembers)
          .set({ role: 'CAPTAIN' })
          .where(eq(teamMembers.id, newCaptain.id));
      } else {
        // No remaining members, delete team
        await db.delete(teamMembers).where(eq(teamMembers.id, membership.id));
        await db.delete(teams).where(eq(teams.id, teamId));
        return { message: 'Team disbanded as last member left' };
      }
    }

    await db.delete(teamMembers).where(eq(teamMembers.id, membership.id));

    return { message: 'Member removed successfully' };
  }

  /**
   * Lock team roster.
   */
  async lockTeam(userId: string, teamId: string): Promise<any> {
    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
    });

    if (!team) {
      const error: any = new Error('Team not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    if (team.captainId !== userId) {
      const error: any = new Error('Only the team captain can lock the team');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    const [updated] = await db
      .update(teams)
      .set({ isLocked: true })
      .where(eq(teams.id, teamId))
      .returning();

    return this.getTeamById(teamId);
  }

  /**
   * Get team details with captain, members, and project.
   */
  async getTeamById(teamId: string): Promise<any> {
    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
      with: {
        captain: {
          with: { profile: true },
        },
        members: {
          with: {
            user: {
              with: { profile: true },
            },
          },
        },
        projects: {
          with: {
            submissions: true,
          },
        },
      },
    });

    if (!team) return null;

    // Sanitize user passwords
    if (team.captain) {
      delete (team.captain as any).passwordHash;
    }
    if (team.members) {
      team.members.forEach((m: any) => {
        if (m.user) delete m.user.passwordHash;
      });
    }

    return team;
  }
}

export const teamsService = new TeamsService();
