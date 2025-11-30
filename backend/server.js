import dotenv from "dotenv";
// Load environment variables from .env file
dotenv.config();
// Importing npm packages
import express from "express";
// ------------------------------------------------------------------------------------------------ //
import cors from "cors";
import cookieParser from "cookie-parser";

// Importing Routes
import authRouter from "./routes/authRoutes.js";
import productRouter from "./routes/productRoutes.js";
import producteurRouter from "./routes/producteurRoute.js";
import cartRouter from "./routes/cartRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import commentRouter from "./routes/commentRoutes.js";
import supportRouter from "./routes/supportRoutes.js";

// Importing Middlewares
import { connectDB } from "./utils/dbConnection.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";
import { logger } from "./services/logger.js";

// ------------------------------------------------------------------------------------------------ //
// Initialize Express application
export const app = express();

// ------------------------------------------------------------------------------------------------ //
// Middleware setup
const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
)
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["set-cookie"],
  })
);

// Trust proxy in production
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
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
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/producteurs", producteurRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/comments", commentRouter);
app.use("/api/support", supportRouter);


// Error Handling Middleware
app.use(globalErrorHandler);

// ---------------------------------------------------------------------------------------------- //
// Connect to MongoDB + Server start
connectDB();
