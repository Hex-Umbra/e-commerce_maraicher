import express from "express";
import { createProduct, getAllProducts } from "../controllers/productsController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyRole } from "../middlewares/verifyRole.js";

const router = express.Router();

router.post("/", verifyToken, verifyRole("producteur"), createProduct);

router.get("/", getAllProducts);

export default router;
