import dotenv from "dotenv";
dotenv.config();
import { connect } from "mongoose";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import logger from "./utils/logger.js";
import authRouter from "./routes/authRoute.js";
import movieRouter from "./routes/movieRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
import watchlistRouter from "./routes/watchlistRoute.js";

try {
  const conn = await connect(process.env.MONGO_URI as string);
  logger.info(`MongoDB connected: ${conn.connection.host}`);
} catch (error: any) {
  logger.error(`Error: ${error.message}`);
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/movies", movieRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/watchlist", watchlistRouter);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "API is running",
  });
});

app.listen(port, () => {
  logger.info(`Server is running in ${process.env.NODE_ENV} mode on port ${port}`);
});
