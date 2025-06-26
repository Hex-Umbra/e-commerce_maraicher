import express from "express";
import { register, login, logout, limiter } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const authRouter = express.Router();

// User registration
authRouter.post("/register", limiter, register);

// User login
authRouter.post("/login", limiter, login);

// User logout
authRouter.post("/logout",verifyToken, logout);

export default authRouter;


