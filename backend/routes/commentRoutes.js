import express from 'express';
import { createComment, getCommentsForProducteur, getAverageRatingForProducteur } from '../controllers/commentsController.js';
import {verifyToken} from '../middlewares/verifyToken.js';
import {verifyRole} from '../middlewares/verifyRole.js';

const router = express.Router();

// Route to create a new comment
router.post('/', verifyToken, verifyRole("client"), createComment);

// Route to get comments for a specific Producteur
router.get('/producteur/:producteurId', getCommentsForProducteur);

// Route to get average rating for a specific Producteur
router.get('/producteur/:producteurId/average-rating', getAverageRatingForProducteur);

export default router;