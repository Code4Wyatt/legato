import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import helmet from "helmet"
import morgan from "morgan"
import listEndpoints from "express-list-endpoints"
import "dotenv/config"

const server = express();
const port = process.env.PORT || 5050

mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
      console.log("Connected to MongoDB");
      console.log(`Server is running on port ${port}`);
      console.table(listEndpoints(server));
  }
);

// Middlewares

server.use(express.json());
server.use(helmet());
server.use(morgan("common"));



export default server