import Product from "../models/productsModel.js";
import { logger } from "../services/logger.js";
import { catchAsync, handleError } from "../utils/handleError.js";

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Producteur)
export const createProduct = catchAsync(async (req, res) => {
  try {
    const newProduct = new Product({ ...req.body, producteurId: req.user._id });
    await newProduct.save();

    // Log the successful creation of the product
    logger.info(`Product created successfully: ${newProduct._id}`, {
      userId: req.user._id,
      productId: newProduct._id,
      productName: newProduct.name,
    });

    // Respond with the created product and a 201 status code
    res.status(201).location(`/api/products/${newProduct._id}`).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    // Log the error for debugging purposes
    handleError(error, "Create Product", req);
    res.status(500).json({
      message: "Error creating product",
      error: error.message,
    });
  }
});

// -------------------------------------------------------------------------------------- //
// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getAllProducts = catchAsync(async (req, res) => {
  try {
    const products = await Product.find().populate(
      "producteurId",
      "name email"
    );

    // Log the retrieval of products
    logger.debug(`Retrieved \x1b[1m${products.length}\x1b[0m products`, {
      userId: req.user ? req.user._id : "anonymous",
    });

    res.status(200).json({
      message: "Products retrieved successfully",
      products,
    });
  } catch (error) {
    // Log the error for debugging purposes
    handleError(error, "Get All Products", req);
    res.status(500).json({
      message: "Error retrieving products",
      error: error.message,
    });
  }
});

// -------------------------------------------------------------------------------------- //
// @desc    Get a product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = catchAsync(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "producteurId",
      "name email"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    // Log in development the successful retrieval of the product
    logger.debug(`Product retrieved successfully: ${product._id}`, {
      userId: req.user ? req.user._id : "anonymous",
      productId: product._id,
      productName: product.name,
    });

    // Respond with the retrieved product and a 200 status code
    res.status(200).json({
      message: "Product retrieved successfully",
      product,
    });
  } catch (error) {}
});
