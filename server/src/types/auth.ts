import { User, Profile, Session, UserRole, UserStatus } from '../db/schema';

export type SafeUser = Omit<User, 'passwordHash'> & {
  profile?: Profile | null;
};

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
      session?: Session;
    }
  }
}
