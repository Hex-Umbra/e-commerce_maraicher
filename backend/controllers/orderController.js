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
export const getProducteurOrders = catchAsync(async (req, res, next) => {
  const producteurId = req.user._id;

  logger.info(
    `Fetching orders for producer: ${producteurId} - ${req.user.name}`
  );

  // Find all orders, but only populate products that belong to this producer
  const orders = await orderModel
    .find({ "products.productId": { $exists: true } })
    .populate({
      path: "products.productId",
      match: { producteurId: producteurId }, // only keep products from this producer
      select: "name price image producteurId",
      populate: { path: "producteurId", select: "name" },
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

// @desc Update order status
// @route PUT /api/orders/:orderId/products/status
// @access Private/Producteur
export const updateProductStatuses = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const producteurId = req.user._id;
    const { orderId } = req.params;
    const { updates } = req.body; // [{ productId, status }, ...]

    logger.info(
      `Producteur ${producteurId} requested status update for order ${orderId}`
    );

    // Validate payload
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      logger.warn(
        `Invalid or empty updates payload from producteur ${producteurId}`
      );
      return next(new AppError("No product updates provided", 400));
    }

    const PRODUCT_STATUS_ENUM =
      orderModel.schema.path("products.0.status").enumValues;

    // Fetch the order with products and client
    const order = await orderModel
      .findById(orderId)
      .populate("products.productId")
      .session(session);

    // If order not found
    if (!order) {
      logger.warn(`Order ${orderId} not found for producteur ${producteurId}`);
      return next(new AppError("Order not found", 404));
    }

    logger.debug(
      `Fetched order ${orderId} with ${order.products.length} products`
    );

    // Track if at least one product got updated
    let hasUpdates = false;

    // Process each update
    for (const { productId, status } of updates) {
      // Validate status
      if (!PRODUCT_STATUS_ENUM.includes(status)) {
        logger.warn(
          `Invalid status "${status}" provided for product ${productId}`
        );
        throw new AppError(`Invalid status: ${status}`, 400);
      }

      // Find product in order
      const productEntry = order.products.find(
        (p) => p.productId && p.productId._id.toString() === productId
      );

      if (!productEntry) {
        logger.warn(`Product ${productId} not found in order ${orderId}`);
        throw new AppError(
          `Product not found in this order: ${productId}`,
          404
        );
      }

      // DEBUGGING INFO -----------------------------------------------------
      logger.debug(
        `Updating product ${productId} - ${productEntry.productId.name} to status "${status}"`
      );
      logger.debug(
        `Producteur of the product: ${productEntry.productId.producteurId}`
      );
      logger.debug(`Requesting producteur: ${producteurId}`);
      // ---------------------------------------------------------------------

      // Check ownership
      if (
        String(productEntry.productId.producteurId) !== String(producteurId)
      ) {
        logger.warn(
          `Unauthorized attempt: producteur ${producteurId} tried updating product ${productId}`
        );
        throw new AppError("Not authorized to update this product", 403);
      }

      // Update status
      productEntry.status = status;
      hasUpdates = true;

      logger.info(
        `Updated product ${productEntry.productId.name} (${productId}) to status "${status}"`
      );
    }

    if (!hasUpdates) {
      logger.warn(`No valid updates applied for order ${orderId}`);
      return next(new AppError("No valid updates applied", 400));
    }

    // Recalculate order status based on products
    const productStatuses = order.products.map((p) => p.status);

    if (productStatuses.every((s) => s === "Livré")) {
      order.status = "Complète";
    } else if (productStatuses.some((s) => s === "Prêt" || s === "Livré")) {
      order.status = "Partiellement complète";
    } else {
      order.status = "En cours";
    }

    logger.info(`Order ${orderId} status recalculated to "${order.status}"`);

    // Save
    await order.save({ session });
    await session.commitTransaction();
    session.endSession();

    logger.info(
      `Order ${orderId} successfully updated by producteur ${producteurId}`
    );

    res.status(200).json({
      status: "success",
      message: "Product statuses updated successfully",
      data: { order },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    logger.error(
      `Failed updating products in order ${req.params.orderId}: ${err.message}`
    );
    next(err); // let globalErrorHandler handle it
  }
});

export const cancelOrder = catchAsync(async (req, res, next) => {
  // Implementation for cancelling an order
  const { orderId } = req.params;
  const userId = req.user._id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await orderModel
      .findOne({ _id: orderId, clientId: userId })
      .session(session);
    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    logger.info(`Cancelling order ${orderId} for user ${userId}`);
    logger.debug(`Current order status: ${order.status}`);
    logger.table(
      order.products.map((p) => ({
        productId: p.productId,
        quantity: p.quantity,
        status: p.status,
      }))
    );

    // Update orders status
    if (order.status === "Annulée") {
      return next(new AppError("Order is already cancelled", 400));
    }
    order.status = "Annulée";

    logger.info(`Order ${orderId} status set to Annulée`);

    // Update product status
    order.products.forEach((product) => {
      product.status = "Annulée";
    });
    await order.save({ session });

    logger.info(`Product statuses in order ${orderId} set to Annulée`);

    // Reset product stock
    for (const item of order.products) {
      await Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: { quantity: item.quantity },
        },
        { session }
      );
    }

    logger.info(`Restocked products for order ${orderId}`);
    // ✅ Restock products
    for (const item of order.products) {
      const updatedProduct = await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } },
        { session, new: true }
      );

      logger.info(
        `Restocked product ${item.productId}: +${item.quantity} units → new stock: ${updatedProduct.quantity}`
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: "success",
      message: "Order cancelled successfully",
      data: { order },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      status: "error",
      message: "Erreur lors de l'annulation de la commande.",
    });
    next(err); // let globalErrorHandler handle it
  }
});
