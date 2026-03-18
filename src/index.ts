// Libraries
import express from "express";
import cors from "cors"
import dotenv from "dotenv"
import { router } from "./routes/route.js";
import { authRouter } from "./routes/auth.js";
import cookieParser from "cookie-parser";
import { verifyToken } from "./middleware/tokenMiddleware.js";

dotenv.config()
const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/v1/auth", authRouter)
app.use("/api/v2/", router)

app.listen(port, () => {
    console.log(`Listening to port ${port}`)
})

