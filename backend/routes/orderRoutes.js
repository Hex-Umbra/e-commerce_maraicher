import express from "express";
import {
    createOrder,
    getUserOrders,
    getAllOrders,
    getOrderById,
    getProducteurOrders,
    updateProductStatuses,
    cancelOrder,
    adminUpdateOrderStatus,
    updateProductStatusInOrder // Import the new function
} from "../controllers/orderController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyRole } from "../middlewares/verifyRole.js";

const router = express.Router();

router.post("/", verifyToken, verifyRole("client", "admin"), createOrder);

router.get("/", verifyToken, verifyRole("client"), getUserOrders);

router.get("/admin", verifyToken, verifyRole("admin"), getAllOrders);
router.get("/admin/:id", verifyToken, verifyRole("admin"), getOrderById); // New route for single order by ID
router.put("/admin/:orderId/products/status", verifyToken, verifyRole("admin"), updateProductStatusInOrder); // New route for updating product statuses in an order

router.put("/admin/:id/status", verifyToken, verifyRole("admin"), adminUpdateOrderStatus);

router.get("/producteur", verifyToken, verifyRole("producteur"), getProducteurOrders);

router.put("/:orderId/products/status", verifyToken, verifyRole("producteur"), updateProductStatuses);

router.delete("/:orderId/cancel", verifyToken, verifyRole("client"), cancelOrder);

export default router;
