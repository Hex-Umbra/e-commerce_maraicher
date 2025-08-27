import express from 'express';
import { createComment } from '../controllers/commentsController.js';
import {verifyToken} from '../middlewares/verifyToken.js';
import {verifyRole} from '../middlewares/verifyRole.js';

const router = express.Router();

// Route to create a new comment
router.post('/', verifyToken, verifyRole("client"), createComment);

export default router;