import express from "express";
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from "../controllers/productsController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyRole } from "../middlewares/verifyRole.js";
import { uploadImage } from "../middlewares/uploadImage.js";

const router = express.Router();

router.post("/", verifyToken, verifyRole("producteur"), uploadImage, createProduct);

router.get("/", getAllProducts);

router.get("/:id", getProductById);

router.put("/:id", verifyToken, verifyRole("producteur"), uploadImage, updateProduct);

router.delete("/:id", verifyToken, verifyRole("producteur"), deleteProduct);

export default router;
