import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { TokenPayload } from "../types/types.js"

export function verifyAdmin(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.access_token

    if (!token) return res.status(401).json({ message: "Token is required." })

    try {
        const payload = jwt.verify(token, process.env.SECRET_TOKEN!) as TokenPayload
        
        if (payload.role !== 'ADMIN') {
            next()
        } else return res.status(401).json({ error: "You can't access this" })
    } catch (err) {
        return res.status(500).json({ error: "Invalid or expired token." })
    }
}