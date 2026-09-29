import { User, Profile, Session, UserStatus } from '../db/schema';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'participant' | 'judge' | 'organizer' | 'admin' | string;
  status?: UserStatus;
  createdAt?: Date;
  updatedAt?: Date;
  profile?: Profile | null;
}

export type SafeUser = (Omit<User, 'passwordHash'> & {
  profile?: Profile | null;
}) | AuthenticatedUser;

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
      session?: Session;
    }
  }
}
