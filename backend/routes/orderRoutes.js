import express from "express";
import {
    createOrder,
    getUserOrders,
    getAllOrders,
    getProducteurOrders,
    updateProductStatuses,
    cancelOrder,
    adminUpdateOrderStatus
} from "../controllers/orderController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyRole } from "../middlewares/verifyRole.js";

const router = express.Router();

router.post("/", verifyToken, verifyRole("client", "admin"), createOrder);

router.get("/", verifyToken, verifyRole("client"), getUserOrders);

router.get("/admin", verifyToken, verifyRole("admin"), getAllOrders);

router.put("/admin/:id/status", verifyToken, verifyRole("admin"), adminUpdateOrderStatus);

router.get("/producteur", verifyToken, verifyRole("producteur"), getProducteurOrders);

router.put("/:orderId/products/status", verifyToken, verifyRole("producteur"), updateProductStatuses);

router.delete("/:orderId/cancel", verifyToken, verifyRole("client"), cancelOrder);

export default router;
