import User from "../models/userModel.js";
import Product from "../models/productsModel.js";
import mongoose from "mongoose";
import { AppError, handleError, catchAsync } from "../utils/handleError.js";
import { logger } from "../services/logger.js";

// ---------------------------------------------------------------------------------------------- //

// Get Current User's Cart
// @desc Get current user's cart
// @route GET /api/cart
// @access Private
export const getCart = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("cart.product");

  res.status(200).json({
    status: "success",
    message: "Panier récupéré avec succès",
    cart: user.cart,
  });
});

// ---------------------------------------------------------------------------------------------- //
// Add Product to Cart
// @desc Add product to cart
// @route POST /api/cart
// @access Private
export const addToCart = catchAsync(async (req, res, next) => {
  // Validate request body
  const { productId, quantity } = req.body;

  const user = await User.findById(req.user._id);
  const product = await Product.findById(productId);

  // Check if productId and quantity are provided
  if (!product) {
    res.status(404).json({ status: "fail", message: "Product not found" });
    return next(new AppError("Product not found", 404));
  }
  if (product.quantity < quantity) {
    return next(new AppError("Insufficient product quantity", 400));
  }

  // Check if product already exists in cart
  const existingItem = user.cart.find(
    (item) => item.product.toString() === productId
  );
  if (existingItem) {
    // Update quantity if product already exists in cart
    existingItem.quantity += quantity;
  } else {
    // Add new product to cart
    user.cart.push({ product: productId, quantity, price: product.price });
  }
  // Save updated user cart
  await user.save();
  res.status(201).json({
    status: "success",
    message: "Produits ajoutés avec succès",
    cart: user.cart,
  });
});

// ---------------------------------------------------------------------------------------------- //
// Remove Product from Cart
// @desc Remove product from cart
// @route DELETE /api/cart/:cartItemId
// @access Private
export const removeFromCart = catchAsync(async (req, res, next) => {
  const { cartItemId } = req.params;
  const user = await User.findById(req.user._id);

  // Validate cartItemId
  if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
    return next(new AppError("Invalid cart item ID", 400));
  }

  // Confirm if the item was actually removed
  const itemStillExists = user.cart.some(
    (item) => item._id.toString() === cartItemId
  );

  logger.debug(
    `Attempting to remove cart item with ID: ${cartItemId}, still exists: ${itemStillExists}`
  );

  if (!itemStillExists) {
    return next(new AppError("Cart item not found", 404));
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { cart: { _id: cartItemId } } },
    { new: true, runValidators: true }
  ).populate("cart.product");

  res.status(200).json({
    status: "success",
    message: "Produit retiré du panier avec succès",
    cart: updatedUser.cart,
  });
});

// ---------------------------------------------------------------------------------------------- //
// Update Product Quantity in Cart
// @desc Update product quantity in cart
// @route PUT /api/cart/:cartItemId
// @access Private

export const updateCartItemQuantity = catchAsync(async (req, res, next) => {
  const { cartItemId } = req.params;
  const { quantity } = req.body;

  // Validate cartItemId
  if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
    res.status(400).json({
      status: "error",
      message: "ID du produit dans le panier invalide",
    });
    return next(new AppError("Invalid cart item ID", 400));
  }

  // Validate request body
  if (!quantity || quantity <= 0) {
    res.status(400).json({
      status: "fail",
      message:
        "Quantité invalide. Veuillez fournir une quantité supérieure à 0.",
    });
    return next(new AppError("Invalid quantity", 400));
  }

  const user = await User.findById(req.user._id);

  // Check if user exists
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Find the cart item to update
  const cartItem = user.cart.id(cartItemId);
  if (!cartItem) {
    return next(new AppError("Cart item not found", 404));
  }

  // Check if the product exists
  const product = await Product.findById(cartItem.product);
  if (!product) {
    return res.status(404).json({
      status: "error",
      message: "Produit introuvable",
    });
  }

  // Check if the requested quantity exceeds available stock
  if (quantity > product.quantity) {
    return res.status(400).json({
      status: "error",
      message: `Stock insuffisant. Quantité disponible : ${product.quantity}`,
    });
  }

  // Update the quantity
  cartItem.quantity = quantity;

  // Save updated user cart
  await user.save();

  logger.debug(`Cart item quantity updated: ${cartItemId} to ${quantity}`);

  res.status(200).json({
    status: "success",
    message: "Quantité mise à jour avec succès",
    cart: user.cart,
  });
});

// ---------------------------------------------------------------------------------------------- //
// Clear Cart
// @desc Clear the user's cart
// @route DELETE /api/cart/clear
// @access Private
export const clearCart = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { cart: [] } },
    { new: true }
  );

  logger.debug(`Cart cleared for user: ${req.user.id}`, user);

  res.status(200).json({
    status: "success",
    message: "Panier vidé avec succès",
    cart: user.cart,
  });
});
