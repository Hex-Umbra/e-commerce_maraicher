import express from "express";
import { createProduct, getAllProducts, getProductById, updateProduct } from "../controllers/productsController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyRole } from "../middlewares/verifyRole.js";

const router = express.Router();

router.post("/", verifyToken, verifyRole("producteur"), createProduct);

router.get("/", getAllProducts);

router.get("/:id", getProductById);

router.put("/:id", verifyToken, verifyRole("producteur"), updateProduct);

export default router;
