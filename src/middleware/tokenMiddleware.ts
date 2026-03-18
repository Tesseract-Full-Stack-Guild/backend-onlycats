import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import { TokenPayload } from "../types/types.js";

export function verifyToken(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.access_token

    if (!token) return res.status(401).json({ message: "Token is required." })

    try {
        const payload = jwt.verify(token, process.env.SECRET_TOKEN!) as TokenPayload

        if (payload.status !== 'ACTIVE') {
            return res.status(403).json({ error: 'Account is not active' });
        }
        
        req.user = {
            userId: payload.userId,
            email: payload.email,
            status: payload.status,
            username: payload.username,
            lastActive: payload.lastActive
        };

        next()
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired access token' });
    }
}