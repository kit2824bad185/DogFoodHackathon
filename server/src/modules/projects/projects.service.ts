import crypto from 'crypto';
import { eq, and } from 'drizzle-orm';
import { db } from '../../db';
import {
  projects,
  submissions,
  teams,
  teamMembers,
  tracks,
  Project,
} from '../../db/schema';
import { CreateProjectInput, UpdateProjectInput } from './projects.schemas';

export class ProjectsService {
  /**
   * Team captain creates a project.
   */
  async createProject(userId: string, data: CreateProjectInput): Promise<any> {
    const teamId = data.teamId || data.team_id!;
    const trackId = data.trackId !== undefined ? data.trackId : data.track_id;
    const repoUrl = data.repoUrl !== undefined ? data.repoUrl : data.repo_url;
    const demoUrl = data.demoUrl !== undefined ? data.demoUrl : data.demo_url;
    const videoUrl = data.videoUrl !== undefined ? data.videoUrl : data.video_url;
    const techStack = data.techStack !== undefined ? data.techStack : data.tech_stack;

    // 1. Verify team exists
    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
    });

    if (!team) {
      const error: any = new Error('Team not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    // 2. Check user is captain of the team
    if (team.captainId !== userId) {
      const error: any = new Error('Only the team captain can create a project');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    // 3. Verify no existing project for this team
    const existing = await db.query.projects.findFirst({
      where: eq(projects.teamId, teamId),
    });

    if (existing) {
      const error: any = new Error('A project already exists for this team');
      error.code = 'CONFLICT';
      error.statusCode = 409;
      throw error;
    }

    // 4. Validate track if provided
    if (trackId) {
      const track = await db.query.tracks.findFirst({
        where: eq(tracks.id, trackId),
      });

      if (!track || track.eventId !== team.eventId) {
        const error: any = new Error('Selected track is invalid for this event');
        error.code = 'INVALID_TRACK';
        error.statusCode = 400;
        throw error;
      }
    }

    const projectId = crypto.randomUUID();
    const submissionId = crypto.randomUUID();
    const now = new Date();

    const [newProject] = await db
      .insert(projects)
      .values({
        id: projectId,
        teamId,
        trackId: trackId || null,
        title: data.title,
        description: data.description || null,
        repoUrl: repoUrl || null,
        demoUrl: demoUrl || null,
        videoUrl: videoUrl || null,
        techStack: techStack || null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Auto-create initial draft submission
    await db.insert(submissions).values({
      id: submissionId,
      projectId,
      isFinal: false,
      status: 'DRAFT',
      submittedAt: null,
      updatedAt: now,
    });

    return this.getProjectById(projectId);
  }

  /**
   * Team members update project details if not locked.
   */
  async updateProject(userId: string, projectId: string, data: UpdateProjectInput): Promise<any> {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      with: {
        team: true,
        submissions: true,
      },
    });

    if (!project) {
      const error: any = new Error('Project not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    // Check user is a member of the project's team
    const membership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.teamId, project.teamId),
        eq(teamMembers.userId, userId)
      ),
    });

    if (!membership) {
      const error: any = new Error('Only team members can edit this project');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    // Check if team's submission is locked
    const isLocked = project.submissions.some((s) => s.status === 'LOCKED' || s.isFinal);
    if (isLocked) {
      const error: any = new Error('Project submission is locked for judging and cannot be edited');
      error.code = 'SUBMISSION_LOCKED';
      error.statusCode = 400;
      throw error;
    }

    const trackId = data.trackId !== undefined ? data.trackId : data.track_id;
    const repoUrl = data.repoUrl !== undefined ? data.repoUrl : data.repo_url;
    const demoUrl = data.demoUrl !== undefined ? data.demoUrl : data.demo_url;
    const videoUrl = data.videoUrl !== undefined ? data.videoUrl : data.video_url;
    const techStack = data.techStack !== undefined ? data.techStack : data.tech_stack;

    // Validate track if updating
    if (trackId && project.team) {
      const track = await db.query.tracks.findFirst({
        where: eq(tracks.id, trackId),
      });

      if (!track || track.eventId !== project.team.eventId) {
        const error: any = new Error('Selected track is invalid for this event');
        error.code = 'INVALID_TRACK';
        error.statusCode = 400;
        throw error;
      }
    }

    const updateData: Partial<Project> = {
      updatedAt: new Date(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (trackId !== undefined) updateData.trackId = trackId;
    if (repoUrl !== undefined) updateData.repoUrl = repoUrl;
    if (demoUrl !== undefined) updateData.demoUrl = demoUrl;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (techStack !== undefined) updateData.techStack = techStack;

    await db.update(projects).set(updateData).where(eq(projects.id, projectId));

    return this.getProjectById(projectId);
  }

  /**
   * Get project details with track, team, and member information.
   */
  async getProjectById(projectId: string): Promise<any> {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      with: {
        track: true,
        team: {
          with: {
            captain: { with: { profile: true } },
            members: {
              with: {
                user: { with: { profile: true } },
              },
            },
          },
        },
        submissions: {
          with: {
            versions: true,
          },
        },
      },
    });

    if (!project) return null;

    // Sanitize user passwords
    if (project.team?.captain) {
      delete (project.team.captain as any).passwordHash;
    }
    if (project.team?.members) {
      project.team.members.forEach((m: any) => {
        if (m.user) delete m.user.passwordHash;
      });
    }

    return project;
  }
}

export const projectsService = new ProjectsService();
