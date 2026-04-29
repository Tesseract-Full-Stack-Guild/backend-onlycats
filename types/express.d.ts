export interface JwtPayload {
  sub: string;
  userId: string;
  username: string;
  email: string;
  role: string;
}

export {};

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
