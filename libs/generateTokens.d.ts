import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../src/prisma/prisma.service.js';
export declare class Tokens {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    generateTokens(user: any): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    storeTokenDB(userId: string, token: string): Promise<void>;
}
