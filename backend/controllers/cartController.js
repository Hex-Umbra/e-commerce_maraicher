import User from "../models/userModel.js";
import Product from "../models/productsModel.js";
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

  if (!product) {
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
