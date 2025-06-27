// Importing npm packages
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

// Importing Routes
import authRouter from "./routes/authRoutes.js";
import productRouter from "./routes/productRoutes.js";
import producteurRouter from "./routes/producteurRoute.js";

// Importing Middlewares
import { connectDB } from "./utils/dbConnection.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";
import { logger } from "./services/logger.js";

// ------------------------------------------------------------------------------------------------ //
// Load environment variables from .env file
dotenv.config();

// ------------------------------------------------------------------------------------------------ //
// Initialize Express application
export const app = express();

// ------------------------------------------------------------------------------------------------ //
// Middleware setup
// Enable CORS for all routes
// This allows cross-origin requests, which is useful for development and API access from different domains.
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
app.use("/api/products", productRouter);
app.use("/api/producteurs", producteurRouter);

// Error Handling Middleware
app.use(globalErrorHandler);

// ---------------------------------------------------------------------------------------------- //
// Connect to MongoDB + Server start
connectDB();
