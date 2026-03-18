import express from "express";
import { welcome } from "../controllers/controller.js";
import { verifyToken } from "../middleware/tokenMiddleware.js";
import { verifyAdmin } from "../middleware/roleMiddleware.js";
export const router = express.Router()

router.use("/", verifyToken, verifyAdmin)
router.get("/", welcome)

