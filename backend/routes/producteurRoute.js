import express from "express";
import { getAllProducteurs } from "../controllers/producteurController.js";

const router = express.Router();

// Route to get all producteurs
router.get("/", getAllProducteurs);

export default router;