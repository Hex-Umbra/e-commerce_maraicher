import express from "express";
import { createOrder } from "../controllers/orderController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyRole } from "../middlewares/verifyRole.js";

const router = express.Router();

router.post("/", verifyToken, verifyRole("client", "admin"), createOrder);

export default router;
