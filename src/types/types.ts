export interface UserParams {
  token: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  status: string;
  username?: string;           // Optional: add username
  lastActive?: Date;            // Optional: track activity
}