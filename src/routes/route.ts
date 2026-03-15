import express from "express";
import { methods, welcome } from "../controllers/controller.js";
export const router = express.Router()

router.get("/", welcome)
router.get("/profile", methods.getProfiles)
