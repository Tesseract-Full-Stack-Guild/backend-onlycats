import { Request, Response } from "express"
import { prisma } from "../utils/prisma.js"

export const welcome = (req: Request, res: Response) => {
    res.send("Welcome to the OnlyCats server!")
}

export const methods = {
    getProfiles: async (req: Request, res: Response) => {
        try {
            const response = await prisma.profile.findMany()
            res.json(response)
        } catch (err) {
            res.status(500).json({
                "message": "Failed to fetch profiles!"
            })
        }
    }
}

