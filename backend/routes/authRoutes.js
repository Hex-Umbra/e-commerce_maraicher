import express from "express";
import { 
  register, 
  login, 
  logout, 
  getMe, 
  limiter,
  verifyEmail,
  resendEmailVerification,
  updateProfile,
  forgotPassword,
  resetPassword
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const authRouter = express.Router();

// User registration
authRouter.post("/register", limiter, register);

// User login
authRouter.post("/login", limiter, login);

// Email verification
authRouter.get("/verify-email", verifyEmail);

// Resend email verification
authRouter.post("/resend-verification", limiter, resendEmailVerification);

// --- Password Reset ---
authRouter.post("/forgot-password", forgotPassword);
authRouter.patch("/reset-password/:token", resetPassword);

// Get current user (me) - Check authentication status
authRouter.get("/me", verifyToken, getMe);

// Update user profile
authRouter.patch("/profile", verifyToken, updateProfile);

// User logout
authRouter.post("/logout", verifyToken, logout);

export default authRouter;


