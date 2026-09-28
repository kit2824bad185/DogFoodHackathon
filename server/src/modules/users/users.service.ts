import crypto from 'crypto';
import { eq, and, or, like, inArray, count, desc } from 'drizzle-orm';
import { db } from '../../db';
import { users, profiles, sessions, Profile, UserRole, UserStatus } from '../../db/schema';
import { SafeUser } from '../../types/auth';
import {
  UpdateProfileInput,
  GetUsersQuery,
} from './users.schemas';

export class UsersService {
  /**
   * Update the profile of an authenticated user.
   */
  async updateProfile(userId: string, data: UpdateProfileInput): Promise<Profile> {
    const existingProfile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, userId),
    });

    const now = new Date();
    const fullName = data.fullName ?? data.full_name;
    const githubUrl = data.githubUrl !== undefined ? data.githubUrl : data.github_url;
    const linkedinUrl = data.linkedinUrl !== undefined ? data.linkedinUrl : data.linkedin_url;
    const tShirtSize = data.tShirtSize !== undefined ? data.tShirtSize : data.t_shirt_size;

    if (existingProfile) {
      const updateData: Partial<Profile> = {
        updatedAt: now,
      };

      if (fullName !== undefined) updateData.fullName = fullName;
      if (data.bio !== undefined) updateData.bio = data.bio;
      if (githubUrl !== undefined) updateData.githubUrl = githubUrl;
      if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl;
      if (data.skills !== undefined) updateData.skills = data.skills;
      if (tShirtSize !== undefined) updateData.tShirtSize = tShirtSize;

      const [updated] = await db
        .update(profiles)
        .set(updateData)
        .where(eq(profiles.userId, userId))
        .returning();

      return updated;
    } else {
      const [created] = await db
        .insert(profiles)
        .values({
          id: crypto.randomUUID(),
          userId,
          fullName: fullName || 'User',
          bio: data.bio || null,
          githubUrl: githubUrl || null,
          linkedinUrl: linkedinUrl || null,
          skills: data.skills || null,
          tShirtSize: tShirtSize || null,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      return created;
    }
  }

  /**
   * Get paginated and filtered list of users for organizers and admins.
   */
  async getUsers(query: GetUsersQuery): Promise<{
    users: SafeUser[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (query.role) {
      conditions.push(eq(users.role, query.role));
    }

    if (query.status) {
      conditions.push(eq(users.status, query.status));
    }

    if (query.search) {
      const searchPattern = `%${query.search.toLowerCase()}%`;
      const matchingProfiles = await db
        .select({ userId: profiles.userId })
        .from(profiles)
        .where(like(profiles.fullName, searchPattern));

      const matchedUserIds = matchingProfiles.map((p) => p.userId);

      if (matchedUserIds.length > 0) {
        conditions.push(
          or(
            like(users.email, searchPattern),
            inArray(users.id, matchedUserIds)
          )
        );
      } else {
        conditions.push(like(users.email, searchPattern));
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [countResult] = await db
      .select({ total: count() })
      .from(users)
      .where(whereClause);

    const total = countResult?.total || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // Fetch users with profiles
    const usersWithProfiles = await db.query.users.findMany({
      where: whereClause,
      with: {
        profile: true,
      },
      orderBy: [desc(users.createdAt)],
      limit,
      offset,
    });

    const safeUsers: SafeUser[] = usersWithProfiles.map((user) => {
      const { passwordHash: _, ...rest } = user;
      return rest;
    });

    return {
      users: safeUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Update status of a user (ACTIVE, INACTIVE, SUSPENDED).
   */
  async updateUserStatus(userId: string, status: UserStatus): Promise<SafeUser> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      const error: any = new Error('User not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    // If account was suspended or inactivated, terminate active sessions immediately
    if (status !== 'ACTIVE') {
      await db.delete(sessions).where(eq(sessions.userId, userId));
    }

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, userId),
    });

    const { passwordHash: _, ...rest } = updatedUser;
    return { ...rest, profile };
  }

  /**
   * Update role of a user (PARTICIPANT, JUDGE, ORGANIZER, ADMIN).
   */
  async updateUserRole(userId: string, role: UserRole): Promise<SafeUser> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      const error: any = new Error('User not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, userId),
    });

    const { passwordHash: _, ...rest } = updatedUser;
    return { ...rest, profile };
  }
}

export const usersService = new UsersService();
