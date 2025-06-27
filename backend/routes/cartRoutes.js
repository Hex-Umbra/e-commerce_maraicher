import express from 'express';
import {addToCart, getCart} from "../controllers/cartController.js";
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

// Get current user's cart
router.get('/', verifyToken, getCart);

router.post('/', verifyToken, addToCart);

export default router;