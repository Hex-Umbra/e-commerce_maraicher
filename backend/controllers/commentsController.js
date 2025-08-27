import commentModel from "../models/commentsModel.js";
import { catchAsync, AppError } from "../utils/handleError.js";
import { logger } from "../services/logger.js";

// @desc Create a new comment
// @route POST /api/comments
// @access Private
export const createComment = catchAsync(async (req, res, next) => {
  const { ProducteurId, comment, rating } = req.body;
  const userId = req.user._id;

  logger.info(`User ${userId} is attempting to create a comment for producer ${ProducteurId}`);

  // Validate input
  if (!ProducteurId || !comment || !rating) {
    return next(new AppError("All fields are required", 400));
  }

  // Validate rating
  if (rating < 1 || rating > 5) {
    return next(new AppError("Rating must be between 1 and 5", 400));
  }

  // Create comment
  const newComment = await commentModel.create({
    userId,
    ProducteurId,
    comment,
    rating,
  });

  logger.info(`Comment created by user ${userId} for producer ${ProducteurId}`);

  res.status(201).json({
    status: "success",
    data: newComment,
  });
});
