import mongoose from 'mongoose';
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

// @desc Get comments for a specific Producteur
// @route GET /api/comments/producteur/:producteurId
// @access Public
export const getCommentsForProducteur = catchAsync(async (req, res, next) => {
  const { producteurId } = req.params;

  logger.info(`Fetching comments for producer ${producteurId}`);

  const comments = await commentModel.find({ ProducteurId: producteurId }).populate('userId', 'username');

  if (!comments || comments.length === 0) {
    return next(new AppError("No comments found for this producer", 404));
  }

  logger.info(`Found ${comments.length} comments for producer ${producteurId}`);

  res.status(200).json({
    status: "success",
    results: comments.length,
    data: comments,
  });
})

// @desc Get average rating for a specific Producteur
// @route GET /api/comments/producteur/:producteurId/average-rating
// @access Public
export const getAverageRatingForProducteur = catchAsync(async (req, res, next) =>{
  const { producteurId } = req.params;

  if (!producteurId) {
    return next(new AppError("Producteur ID is required", 400));
  }

  logger.info(`Calculating average rating for producer ${producteurId}`);

  const result = await commentModel.aggregate([
    { $match: { ProducteurId: new mongoose.Types.ObjectId(producteurId) } },
    {
      $group: {
        _id: "$ProducteurId",
        averageRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  if (result.length === 0) {
    return next(new AppError("No ratings found for this producer", 404));
  }

  const { averageRating, totalRatings } = result[0];

  logger.info(`Average rating for producer ${producteurId} is ${averageRating} based on ${totalRatings} ratings`);

  res.status(200).json({
    status: "success",
    data: {
      averageRating,
      totalRatings
    }
  });
})
