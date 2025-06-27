import express from 'express';
import {addToCart, getCart, removeFromCart, updateCartItemQuantity, clearCart} from "../controllers/cartController.js";
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

// Get current user's cart
router.get('/', verifyToken, getCart);

router.post('/', verifyToken, addToCart);

router.delete("/clear", verifyToken, clearCart);

router.delete("/:cartItemId", verifyToken, removeFromCart);

router.put("/:cartItemId", verifyToken, updateCartItemQuantity);


export default router;