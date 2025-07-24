import 'express-session';
import { UserRole } from './core/types/Enum';

declare module 'express-session' {
  interface SessionData {
    encryptedUserId?: string;
    rememberMeStatus?: boolean;
    user?: {
      id: number;
      username: string;
      nickname: string;
      role: UserRole;
    };
  }
}
