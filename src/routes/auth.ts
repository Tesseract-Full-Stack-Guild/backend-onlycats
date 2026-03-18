import e from "express";
import { authMethods } from "../controllers/auth.js";
export const authRouter = e.Router()

authRouter.post("/register", authMethods.register)
authRouter.post("/login", authMethods.login)
authRouter.post("/logout", authMethods.logout)
authRouter.post("/refresh", authMethods.refresh)
authRouter.post("/email-verify/:token", authMethods.verifyEmail)
authRouter.post("/request-password-reset", authMethods.requestPasswordReset)
authRouter.post("/password-reset/:token", authMethods.passwordReset)