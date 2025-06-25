import express from "express";
import { register, login, logout, limiter } from "../controllers/authController.js";

const authRouter = express.Router();

// User registration
authRouter.post("/register", limiter, register);

// User login
authRouter.post("/login", limiter, login);

// User logout
authRouter.post("/logout", logout);

export default authRouter;


