import { User } from "../../generated/prisma/client.ts";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        status: string;
        username?: string;
        profileComplete?: boolean;
        lastActive?: Date;
      };
    }
  }
}