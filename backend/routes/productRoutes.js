import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from "../controllers/productsController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyRole } from "../middlewares/verifyRole.js";
import { uploadImage } from "../middlewares/uploadImage.js";

const router = express.Router();

router.post("/", verifyToken, verifyRole("producteur"), uploadImage, createProduct);
router.post("/admin", verifyToken, verifyRole("admin"), uploadImage, adminCreateProduct);

router.get("/", getAllProducts);

router.get("/:id", getProductById);

router.put("/:id", verifyToken, verifyRole("producteur"), uploadImage, updateProduct);
router.put("/admin/:id", verifyToken, verifyRole("admin"), uploadImage, adminUpdateProduct);

router.delete("/:id", verifyToken, verifyRole("producteur"), deleteProduct);
router.delete("/admin/:id", verifyToken, verifyRole("admin"), adminDeleteProduct);

export default router;
