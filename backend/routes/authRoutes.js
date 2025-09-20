import express from "express";
import { register, login, logout, getMe, limiter } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const authRouter = express.Router();

// User registration
authRouter.post("/register", limiter, register);

// User login
authRouter.post("/login", limiter, login);

// Get current user (me) - Check authentication status
authRouter.get("/me", verifyToken, getMe);

// User logout
authRouter.post("/logout", verifyToken, logout);

export default authRouter;


