import crypto from 'crypto';
import { eq, and, ne, gt } from 'drizzle-orm';
import { db } from '../../db';
import { users, profiles, sessions, Session } from '../../db/schema';
import { SafeUser } from '../../types/auth';
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  hashToken,
  SESSION_DURATION_MS,
} from './auth.utils';
import { RegisterInput, LoginInput, ChangePasswordInput } from './auth.schemas';

export interface RequestMeta {
  ipAddress?: string;
  userAgent?: string;
}

export class AuthService {
  /**
   * Create a new session record for a user.
   */
  async createSession(
    userId: string,
    meta: RequestMeta = {}
  ): Promise<{ token: string; session: Session }> {
    const rawToken = generateSessionToken();
    const tokenHash = hashToken(rawToken);
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    const now = new Date();

    const [session] = await db
      .insert(sessions)
      .values({
        id: sessionId,
        userId,
        tokenHash,
        ipAddress: meta.ipAddress || null,
        userAgent: meta.userAgent || null,
        expiresAt,
        createdAt: now,
      })
      .returning();

    return { token: rawToken, session };
  }

  /**
   * Validate a raw session token and return user + session.
   */
  async validateSession(rawToken: string): Promise<{ session: Session; user: SafeUser } | null> {
    const tokenHash = hashToken(rawToken);

    const session = await db.query.sessions.findFirst({
      where: and(
        eq(sessions.tokenHash, tokenHash),
        gt(sessions.expiresAt, new Date())
      ),
      with: {
        user: {
          with: {
            profile: true,
          },
        },
      },
    });

    if (!session || !session.user) {
      return null;
    }

    if (session.user.status !== 'ACTIVE') {
      return null;
    }

    const { passwordHash: _, ...safeUserFields } = session.user;
    const safeUser: SafeUser = safeUserFields;

    return { session, user: safeUser };
  }

  /**
   * Register a new user with initial profile and session.
   */
  async register(
    data: RegisterInput,
    meta: RequestMeta = {}
  ): Promise<{ user: SafeUser; token: string }> {
    const normalizedEmail = data.email.toLowerCase();

    // Check if user already exists
    const existing = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    if (existing) {
      const error: any = new Error('A user with this email address already exists');
      error.code = 'CONFLICT';
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await hashPassword(data.password);
    const userId = crypto.randomUUID();
    const profileId = crypto.randomUUID();
    const now = new Date();

    await db.insert(users).values({
      id: userId,
      email: normalizedEmail,
      passwordHash,
      role: 'PARTICIPANT',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(profiles).values({
      id: profileId,
      userId,
      fullName: data.fullName,
      createdAt: now,
      updatedAt: now,
    });

    const safeUser: SafeUser = {
      id: userId,
      email: normalizedEmail,
      role: 'PARTICIPANT',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      profile: {
        id: profileId,
        userId,
        fullName: data.fullName,
        bio: null,
        githubUrl: null,
        linkedinUrl: null,
        skills: null,
        tShirtSize: null,
        createdAt: now,
        updatedAt: now,
      },
    };

    const { token } = await this.createSession(userId, meta);

    return { user: safeUser, token };
  }

  /**
   * Authenticate user by email and password and return session token.
   */
  async login(
    data: LoginInput,
    meta: RequestMeta = {}
  ): Promise<{ user: SafeUser; token: string }> {
    const normalizedEmail = data.email.toLowerCase();

    const user = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
      with: {
        profile: true,
      },
    });

    if (!user) {
      const error: any = new Error('Invalid email or password');
      error.code = 'UNAUTHORIZED';
      error.statusCode = 401;
      throw error;
    }

    if (user.status !== 'ACTIVE') {
      const error: any = new Error(`Account is ${user.status.toLowerCase()}`);
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    const isValidPassword = await verifyPassword(user.passwordHash, data.password);
    if (!isValidPassword) {
      const error: any = new Error('Invalid email or password');
      error.code = 'UNAUTHORIZED';
      error.statusCode = 401;
      throw error;
    }

    const { passwordHash: _, ...safeUserFields } = user;
    const safeUser: SafeUser = safeUserFields;

    const { token } = await this.createSession(user.id, meta);

    return { user: safeUser, token };
  }

  /**
   * Log out active session.
   */
  async logout(sessionId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  /**
   * Get user by ID with profile.
   */
  async getMe(userId: string): Promise<SafeUser | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        profile: true,
      },
    });

    if (!user) return null;

    const { passwordHash: _, ...safeUserFields } = user;
    return safeUserFields;
  }

  /**
   * Change user password and revoke other sessions.
   */
  async changePassword(
    userId: string,
    currentSessionId: string,
    data: ChangePasswordInput
  ): Promise<void> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      const error: any = new Error('User not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    const isValidPassword = await verifyPassword(user.passwordHash, data.oldPassword);
    if (!isValidPassword) {
      const error: any = new Error('Current password is incorrect');
      error.code = 'UNAUTHORIZED';
      error.statusCode = 401;
      throw error;
    }

    const newPasswordHash = await hashPassword(data.newPassword);
    const now = new Date();

    await db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: now,
      })
      .where(eq(users.id, userId));

    // Revoke all other sessions for this user
    await db
      .delete(sessions)
      .where(and(eq(sessions.userId, userId), ne(sessions.id, currentSessionId)));
  }
}

export const authService = new AuthService();
