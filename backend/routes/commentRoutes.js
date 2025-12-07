import express from "express";
import {
  createComment,
  getCommentsForProducteur,
  getAverageRatingForProducteur,
  updateComment,
  deleteComment,
  getUserComments,
  getAllComments,
  deleteCommentByAdmin,
} from "../controllers/commentsController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyRole } from "../middlewares/verifyRole.js";

const router = express.Router();

// Route to create a new comment
router.post("/", verifyToken, verifyRole("client"), createComment);

// Route to get all comments (admin only)
router.get("/admin", verifyToken, verifyRole("admin"), getAllComments);

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

// Route to delete a comment by admin
router.delete("/admin/:id", verifyToken, verifyRole("admin"), deleteCommentByAdmin);

// Route to get comments made by the requested user
router.get("/user/:userId", getUserComments);

export default router;
