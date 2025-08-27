import express from "express";
import {
  createComment,
  getCommentsForProducteur,
  getAverageRatingForProducteur,
  updateComment,
  deleteComment
} from "../controllers/commentsController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyRole } from "../middlewares/verifyRole.js";

const router = express.Router();

// Route to create a new comment
router.post("/", verifyToken, verifyRole("client"), createComment);

// Route to get comments for a specific Producteur
router.get("/producteur/:producteurId", getCommentsForProducteur);

// Route to get average rating for a specific Producteur
router.get(
  "/producteur/:producteurId/average-rating",
  getAverageRatingForProducteur
);

// Route to update a comment
router.put("/:commentId", verifyToken, verifyRole("client"), updateComment);

// Route to delete a comment
router.delete("/:commentId", verifyToken, verifyRole("client"), deleteComment);

export default router;
