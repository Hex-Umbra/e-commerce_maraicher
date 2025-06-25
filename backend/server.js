import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js";
import { connectDB } from "./utils/dbConnection.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";
import { logger } from "./services/logger.js";

dotenv.config();

export const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ----------------------------------------------------------------------------------------------- //
// Debug Middleware
app.use((req, res, next) => {
  logger.warn(`${req.method} ${req.path}`, req.body);
  next();
});

// ----------------------------------------------------------------------------------------------- //
// Routes
// Authentication Routes
app.use("/api/auth", authRouter);

// Error Handling Middleware
app.use(globalErrorHandler);

// ---------------------------------------------------------------------------------------------- //
// Connect to MongoDB + Server start
connectDB();
