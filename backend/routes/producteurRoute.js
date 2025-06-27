import express from "express";
import {
  getAllProducteurs,
  getProductsByProducteur,
  getProducteurById,
} from "../controllers/producteurController.js";

const router = express.Router();

// Route to get all producteurs
router.get("/", getAllProducteurs);

router.get("/:id/products", getProductsByProducteur);

router.get("/:id", getProducteurById);

export default router;
