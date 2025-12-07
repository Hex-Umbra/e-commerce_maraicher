import express from "express";
import { getDashboardStats } from "../controllers/adminController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyRole } from "../middlewares/verifyRole.js";

const router = express.Router();

router.get("/stats", verifyToken, verifyRole("admin"), getDashboardStats);

export default router;
