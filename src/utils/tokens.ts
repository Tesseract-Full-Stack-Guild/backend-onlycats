import crypto from "crypto"
import jwt, { Secret } from "jsonwebtoken"
import { TokenPayload } from "../types/types.js"

const secret: Secret = process.env.SECRET_TOKEN ||  "your-very-secure-secret-key"

export function createCryptoToken(): string {
    return crypto.randomBytes(40).toString('hex')

}

export function createJwtToken(user: any): string {
    const payload: TokenPayload = {
        userId: user.id,
        username: user.username,
        email: user.email,
        status: user.status,
        role: user.role,
        lastActive: user.lastActive
    }

    return jwt.sign(payload, secret, {expiresIn: '15m'})
}

export function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
}