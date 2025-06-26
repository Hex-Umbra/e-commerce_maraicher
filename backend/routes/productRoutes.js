import express from "express";
import { createProduct } from "../controllers/productsController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, createProduct);

export default router;
