// Libraries
import express from "express";
import cors from "cors"
import dotenv from "dotenv"
import { router } from "./routes/route.js";

dotenv.config()
const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use("/api/v1/", router)

app.listen(port, () => {
    console.log(`Listening to port ${port}`)
})

