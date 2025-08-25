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

    if (!user.cart || user.cart.length === 0) {
      return next(new AppError("Cart is empty", 400));
    }

    const orderProducts = [];

    for (const item of user.cart) {
      const product = await Product.findById(item.product._id).session(session);

      if (!product) {
        throw new AppError(
          `Product with ID ${item.product._id} not found`,
          404
        );
      }

      if (product.quantity < item.quantity) {
        throw new AppError(
          `Insufficient stock for product: ${product.name} (Available: ${product.quantity}, Requested: ${item.quantity})`,
          400
        );
      }

      // Deduct stock
      product.quantity -= item.quantity;
      await product.save({ session });

      logger.info(
        `Stock updated for ${product.name}: -${item.quantity}, Remaining: ${product.quantity}`
      );

      orderProducts.push({
        productId: product._id,
        quantity: item.quantity,
        price: item.price,
      });
    }

    logger.table(
      "Products in order",
      orderProducts.map((p) => ({
        productId: p.productId,
        quantity: p.quantity,
        price: p.price,
        status: p.status,
      }))
    );

    const floatAmount = orderProducts.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const totalAmount = parseFloat(floatAmount.toFixed(2));

    // Create the order
    const order = await orderModel.create(
      [
        {
          clientId: userId,
          products: orderProducts,
          totalAmount,
        },
      ],
      { session }
    );

    logger.debug(`Order created: ${order}`);

    // Clear user's cart
    user.cart = [];
    await user.save({ session });
    logger.info(`Cleared cart for user: ${userId} - ${user.name}`);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    logger.info(
      `Order created successfully for user: ${userId} - ${user.name}`
    );
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

// @desc Get all orders for a user
// @route GET /api/orders
// @access Private
export const getUserOrders = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  logger.info(`Fetching orders for user: ${userId} - ${req.user.name}`);

  const orders = await orderModel
    .find({ clientId: userId })
    .populate("products.productId", "name price image ")
    .sort({ createdAt: -1 });

  logger.debug(`Orders found: ${orders.length}`);
  logger.table(
    orders.map((order) => ({
      id: order._id,
      totalAmount: `${order.totalAmount}€`,
      status: order.status,
      createdAt: order.createdAt,
    }))
  );

  if (!orders || orders.length === 0) {
    return next(new AppError("No orders found for this user", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Orders retrieved successfully",
    data: {
      orders,
    },
  });
});

// @desc Get all orders for admin
// @route GET /api/orders/admin
// @access Private/Admin
export const getAllOrders = catchAsync(async (req, res, next) => {
  logger.info("Fetching all orders for admin");

  const orders = await orderModel
    .find()
    .populate("clientId", "name email")
    .populate("products.productId", "name price image")
    .sort({ createdAt: -1 });

  logger.debug(`Total orders found: ${orders.length}`);

  if (!orders || orders.length === 0) {
    return next(new AppError("No orders found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "All orders retrieved successfully",
    data: {
      orders,
    },
  });
});

// @desc getProductedOrder
// @route GET /api/orders/producteur
// @access Private/Producteur
export const getProducerOrders = catchAsync(async (req, res, next) => {
  const producteurId = req.user._id;

  logger.info(`Fetching orders for producer: ${producteurId} - ${req.user.name}`);

  // Find all orders, but only populate products that belong to this producer
  const orders = await orderModel
    .find({ "products.productId": { $exists: true } })
    .populate({
      path: "products.productId",
      match: { producteurId: producteurId }, // only keep products from this producer
      select: "name price image createdBy",
    })
    .populate("clientId", "name email address")
    .sort({ createdAt: -1 });

  logger.debug(`Total orders fetched: ${orders.length}`);
  logger.table(
    orders.map((order) => ({
      id: order._id,
      totalAmount: `${order.totalAmount}€`,
      status: order.status,
      createdAt: order.createdAt,
    }))
  );

  // Keep only orders where this producer has products, and recalc producerTotal
  const filteredOrders = orders
    .map((order) => {
      const filteredProducts = order.products.filter((p) => p.productId);

      const producerTotal = filteredProducts.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      return {
        ...order.toObject(),
        products: filteredProducts,
        producerTotal: parseFloat(producerTotal.toFixed(2)),
      };
    })
    .filter((order) => order.products.length > 0);

    // If no orders found for this producer
  if (filteredOrders.length === 0) {
    return next(new AppError("No orders found for your products", 404));
  }

  // logging the filtered orders
  logger.debug(`Orders found for producer: ${filteredOrders.length}`);
  logger.table(
    filteredOrders.map((order) => ({
      id: order._id,
      producerTotal: `${order.producerTotal}€`,
      status: order.status,
      createdAt: order.createdAt,
    }))
  );

  res.status(200).json({
    status: "success",
    message: "Orders retrieved successfully",
    data: { orders: filteredOrders },
  });
});
