import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import listEndpoints from "express-list-endpoints"
import authRouter from "./routes/auth/index.js"
import userRouter from "./routes/user/index.js"
import postRouter from "./routes/posts/index.js"
import { unauthorizedHandler, forbiddenHandler, catchAllHandler } from "./errorHandlers.js"
import "dotenv/config"

const server = express()

const port = process.env.PORT || 5050


// Middlewares
server.use(cors())
server.use(express.json())


server.use("/auth", authRouter)
server.use("/users", userRouter)
server.use("/timeline", postRouter)

// ERROR HANDLERS 
server.use(unauthorizedHandler)
server.use(forbiddenHandler)
server.use(catchAllHandler)

mongoose.connect(process.env.MONGO_CONNECTION)

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected!")
  server.listen(port, () => {
    console.table(listEndpoints(server))
    console.log(`Server is running on port ${port}`)
  })
})

export default server