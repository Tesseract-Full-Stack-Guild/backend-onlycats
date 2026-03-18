import { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import { bcrpytMethods } from "../utils/bcrypt.js";
import { transporter } from "../utils/nodemailer.js";
import { createCryptoToken, createJwtToken, hashToken } from "../utils/tokens.js";
import { UserParams } from "../types/types.js";
import crypto from "crypto"
import { checkPasswordStrength } from "../utils/passwordChecker.js";

export const authMethods = {
    register: async (req: Request, res: Response) => {
        try {
            const { username, email, password, phone } = req.body

            if (!username || !email || !password) return res.status(400).json({ "message": "Enter all fields!" })
            
            const exisitingEmail = await prisma.user.findUnique({
                where: {
                    email: email
                }
            })

            const exisitingUsername = await prisma.user.findUnique({
                where: { username: username}
            })

            if (exisitingEmail) return res.status(400).json({ "message": "Email already taken!" })
            if (exisitingUsername) return res.status(400).json({ "message": "Username already exist!" })

             const strengthCheck = checkPasswordStrength(password);
  
            if (!strengthCheck.isValid) {
                return res.status(400).json({
                    error: 'Password is too weak',
                    feedback: strengthCheck.feedback,
                    requirements: strengthCheck.errors
                });
            }

            const hashedPassword = await bcrpytMethods.hashPassword(password)

            const newUser = await prisma.user.create({
                data: {
                    username: username,
                    email: email,
                    passwordHash: hashedPassword,
                    phone: phone
                }
            })

            const emailVerifyToken = createCryptoToken()
            await prisma.emailVerificationToken.create({
                data: {
                    userId: newUser.id,
                    tokenHash: hashToken(emailVerifyToken)
                }
            })

            await transporter.sendMail({
                from: '"OnlyCats" <onlycats@gmail.com>',
                to: `${email}`,
                subject: "Email verification",
                html: `
                    <b>Please verify your account with the link below.</b>
                    <br/>
                    <a href="${process.env.DOMAIN}/api/v1/auth/email-verify/${emailVerifyToken}">Verify now.</a>
                `
            })
            res.status(200).json({
                "message": "Check your inbox for verification link."
            })
        } catch (err) {
            console.log(err)
            res.status(500).json({
                "message": "Failed to register user!"
            })
        }
    },

    verifyEmail: async (req: Request<UserParams>, res: Response) => {
        try {
            const { token } = req.params

            const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

            const existingToken = await prisma.emailVerificationToken.findUnique({ where: { tokenHash: hashedToken }})

            if (!existingToken || new Date() > new Date(existingToken.expiresAt) || existingToken.used == true) res.status(401).json({
                "message": "Invalid or expired token!"
            })

            await prisma.$transaction([
                prisma.user.update({
                    where: {
                        id: existingToken?.userId
                    }, data: {
                        status: "ACTIVE"
                    }
                }),

                prisma.emailVerificationToken.updateMany({
                    where: {
                        tokenHash: hashedToken,
                        used: false
                    }, data: {
                        used: true
                    }
                })
            ])

            res.status(200).json({
                "message": "Account verified!"
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                error: "Failed to verify account!"
            })
        }
    },

    login: async (req: Request, res: Response) => {
        try {
            const { user, password } = req.body

            if (!user || !password) return res.status(400).json({ "message": "Enter all fields!" })
            
            let exisitingUser = await prisma.user.findUnique({
                where: {
                    username: user
                }
            })

            if (!exisitingUser) {
                exisitingUser = await prisma.user.findUnique({ where: {email: user}})
                if (!exisitingUser) return res.status(401).json({ message: "Invalid username/email or password." })
            }

            const correctPassword = await bcrpytMethods.comparePassword(password, exisitingUser.passwordHash)

            if (!correctPassword) return res.status(401).json({ message: "Invalid username/email or password." })

            if (exisitingUser.status == 'UNVERIFIED') {
                const emailVerifyToken = createCryptoToken()

                await prisma.emailVerificationToken.create({
                    data: {
                        userId: exisitingUser.id,
                        tokenHash: hashToken(emailVerifyToken)
                    }
                })

                await transporter.sendMail({
                    from: '"OnlyCats" <onlycats@gmail.com>',
                    to: `${exisitingUser.email}`,
                    subject: "Email verification",
                    html: `
                        <b>Please verify your account with the link below.</b>
                        <br/>
                        <a href="${process.env.DOMAIN}/api/v1/auth/email-verify/${emailVerifyToken}">Verify now.</a>
                    `
                })

                return res.status(200).json({
                    "message": "Your not verified yet, check your inbox for verification link."
                })
            }

            const accessToken = createJwtToken({
                userId: exisitingUser.id,
                username: exisitingUser.username,
                email: exisitingUser.email,
                status: exisitingUser.status,
                role: exisitingUser.role,
                lastActive: exisitingUser.lastActive
            })
            const refreshToken = createCryptoToken()

            await prisma.refreshToken.create({
                data: {
                    userId: exisitingUser.id,
                    tokenHash: hashToken(refreshToken),
                    deviceInfo: {
                        userAgent: req.headers['user-agent'],
                        ip: req.ip
                    }
                }
            })

            res.cookie('access_token', accessToken, {
                maxAge: 15 * 60 * 1000, // 15 minutes
                httpOnly: true,
                secure: true
            })

            res.cookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            })

            res.status(200).json({
                "message": "Logged in!",
                exisitingUser,
                refreshToken,
                accessToken
            })
        } catch (err) {
            console.log(err)
            res.status(500).json({
                "message": "Failed to log in!"
            })
        }
    },

    logout: async (req: Request, res: Response) => {
        try {
            const token = req.cookies.refresh_token

            if (token) {
                await prisma.refreshToken.updateMany({
                    where: {
                        tokenHash: hashToken(token),
                        revoked: false
                    }, data: {
                        revoked: true,
                        revokeReason: 'logout'
                    }
                })
            }

            res.clearCookie('refresh_token')
            res.clearCookie('access_token')

            res.status(200).json({
                message: "Logged out!"
            })
        } catch (err) {
            console.log(err)
            res.status(500).json({
                message: "Failed to log out!"
            })
        }
    },

    refresh: async (req: Request, res: Response) => {
        try {
            const token = req.cookies.refresh_token

            if (!token) return res.status(401).json({ message: "Refresh token required." })

            const dbToken = await prisma.refreshToken.findUnique({
                where: {
                    tokenHash: hashToken(token),
                    revoked: false,
                    expiresAt: {
                        gt: new Date()
                    }
                },
                include: {
                    user: true
                }
            })

            if (!dbToken) return res.status(401).json({ message: "Invalid token." })

            const user = await prisma.user.findUnique({
                where: {
                    id: dbToken.userId,
                    status: 'ACTIVE'
                }
            })

            if (!user) return res.status(401).json({ message: "User is not found or is not active."})

            const newRefreshToken = createCryptoToken()
            const newAccessToken = createJwtToken({
                userId: user.id,
                username: user.username,
                email: user.email,
                status: user.status,
                role: user.role,
                lastActive: user.lastActive
            })

            await prisma.$transaction([
                prisma.refreshToken.updateMany({
                    where: {
                        tokenHash: hashToken(token),
                        revoked: false
                    }, data: {
                        revoked: true
                    }
                }),
                prisma.refreshToken.create({
                    data: {
                        tokenHash: hashToken(newRefreshToken),
                        userId: user.id,
                        deviceInfo: {
                            userAgent: req.headers['user-agent'],
                            ip: req.ip
                        }
                    }
                })
            ])

            res.cookie('access_token', newAccessToken, {
                maxAge: 15 * 60 * 1000, // 15 minutes
                httpOnly: true,
                secure: true
            })

            res.cookie('refresh_token', hashToken(newRefreshToken), {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            })
            
            res.status(200).json({ message: "Refreshed tokens." })
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: "Failed to refresh tokens." })
        }
    },

    requestPasswordReset: async ( req: Request, res: Response ) => {
        const { email } = req.body

        if (!email) return res.status(400).json({ message: "Enter an email please."})

        try {
            const user = await prisma.user.findUnique({ where: { email: email } })

            if (!user) return res.status(404).json({ message: "User doesn't exist." })

            const token = createCryptoToken()

            await prisma.passwordResetToken.create({
                data: {
                    tokenHash: hashToken(token),
                    userId: user.id,
                    emailSnapshot: email
                }
            })

            await transporter.sendMail({
                from: '"OnlyCats" <onlycats@gmail.com',
                to: `${email}`,
                subject: "Password Reset",
                html: `
                    <b>You can reset your password with the link below.</b>
                    <b/><b/>
                    <a href="http://${process.env.DOMAIN}/api/v1/auth/password-reset/${token}">Reset now.</a>
                `
            })

            res.status(200).json({
                "message": "Check your inbox for password reset link."
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({ error: "Failed to request password reset" })
        }
    },

    passwordReset: async ( req: Request<UserParams>, res: Response ) => {
        const { token } = req.params
        const { newPassword } = req.body 

        if (!token) return res.status(401).json({ message: "Token is required."})

        if (!newPassword) return res.status(400).json({ message: "Password is required." })

        try {
            const hashedToken = hashToken(token)

            const recordedToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashedToken }})

            if (!recordedToken || new Date() > new Date(recordedToken.expiresAt) || recordedToken.used == true || recordedToken.invalidated == true) 
                return res.status(401).json({ message: "Invalid or expired token." })

            const hashedPassword = await bcrpytMethods.hashPassword(newPassword)

            const user = await prisma.user.findUnique({ where: { id: recordedToken.userId, email: recordedToken.emailSnapshot} })

            if (hashedPassword == user?.passwordHash) return res.status(400).json({ message: "You can't use your previous password." })

            await prisma.$transaction([
                prisma.user.update({
                    where: { id: recordedToken.userId },
                    data: {
                        passwordHash: hashedPassword
                    }
                }),

                prisma.passwordResetToken.updateMany({
                    where: { tokenHash: hashedToken },
                    data: {
                        used: true,
                        invalidated: true
                    }
                })
            ])

            res.status(200).json({ message: "Password Reset Success." })

        } catch (err) {
            console.log(err)
            return res.status(500).json({ error: "Failed to reset password." })
        }
    }
}