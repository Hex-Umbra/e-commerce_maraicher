import express from "express";
import { createOrder, getUserOrders, getAllOrders, getProducerOrders } from "../controllers/orderController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyRole } from "../middlewares/verifyRole.js";

const router = express.Router();

router.post("/", verifyToken, verifyRole("client", "admin"), createOrder);

router.get("/", verifyToken, verifyRole("client"), getUserOrders);

router.get("/admin", verifyToken, verifyRole("admin"), getAllOrders);

router.get("/producteur", verifyToken, verifyRole("producteur"), getProducerOrders);

export default router;
