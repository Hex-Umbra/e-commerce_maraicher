import mongoose from "mongoose";
import { catchAsync, AppError, handleError } from "../utils/handleError.js";
import { logger } from "../services/logger.js";
import User from "../models/userModel.js";
import Product from "../models/productsModel.js";
import orderModel from "../models/orderModel.js";

// @desc Create a new order
// @route POST /api/orders
// @access Private
export const createOrder = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    logger.info(`Creating order for user: ${userId}`);

    // Check if user exists and has items in cart
    const user = await User.findById(userId).session(session);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (!user.cart || Object.keys(user.cart).length === 0) {
      return next(new AppError("Cart is empty", 400));
    }

    let totalAmount = 0;
    const orderProducts = [];

    // Calculate total price and prepare order products
    for (const cartItem of user.cart) {
      logger.debug(cartItem.product);

      const product = await Product.findById(cartItem.product).session(session);
      if (!product) {
        return next(new AppError(`Product with ID ${cartItem} not found`, 404));
      }
      if (product.quantity < cartItem.quantity) {
        return next(
          new AppError(`Insufficient stock for product ${product.name}`, 400)
        );
      }

      // Update product stock
      product.quantity -= cartItem.quantity;
      await product.save({ session });
      logger.info(`Updated product stock for ${product.name}`);

      // Create order product entry
      orderProducts.push({
        productId: cartItem,
        quantity: cartItem.quantity,
        price: cartItem.price,
      });

      totalAmount += product.price * cartItem.quantity;
    }


    // Create the order
    const order = await orderModel.create(
      [
        {
          clientId: userId,
          products: orderProducts,
          totalAmount,
          status: "pending",
        },
      ],
      { session }
    );

logger.debug(`Order created: ${order}`);

    // Clear user's cart
    user.cart = [];
    await user.save({ session });
    logger.info(`Cleared cart for user: ${userId}`);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    logger.info(`Order created successfully for user: ${userId}`);
    res.status(201).json({
      status: "success",
      data: {
        order,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    handleError(err, "Creating order", req);

    return res.status(500).json({
      status: "error",
      message: "Erreur lors de la création de la commande.",
      error: err.message,
    });
  }
});
