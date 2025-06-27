import express from "express";
import {
  getAllProducteurs,
  getProductsByProducteur,
  getProducteurById,
} from "../controllers/producteurController.js";

const router = express.Router();

// Route to get all producteurs
router.get("/", getAllProducteurs);

router.get("/:id", getProducteurById);

router.get("/:id/products", getProductsByProducteur);

export default router;
