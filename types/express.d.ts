import { User } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  userId?: string;
  email?: string;
  role?: string;
}

export {};

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
