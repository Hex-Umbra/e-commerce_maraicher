import { catchAsync, AppError, handleError } from "../utils/handleError.js";
import { logger } from "../services/logger.js";
import User from "../models/userModel.js";
import Product from "../models/productsModel.js";
import orderModel from "../models/orderModel.js";

// @desc Create a new order
// @route POST /api/orders
// @access Private
export const createOrder = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("cart.product");

  if (!user || user.cart.length === 0) {
    logger.warn("Le panier est vide ou l'utilisateur n'existe pas");
    return res.status(400).json({
      status: "error",
      message: "Votre panier est vide",
    });
  }
});
