import User from "../models/userModel.js";
import Product from "../models/productsModel.js";
import { catchAsync, AppError, handleError } from "../utils/handleError.js";
import { logger } from "../services/logger.js";

// @desc    Get all producers
// @route   GET /api/producers
// @access  Public
export const getAllProducteurs = catchAsync(async (req, res) => {
  try {
    // Getting all producteurs from the database
    const producteurs = await User.find({ role: "producteur" })
      .select("name email address role createdAt")
      .sort({ createdAt: -1 });

    logger.debug(`\x1b[1m${producteurs.length}\x1b[0m produteurs récupérés`);

    res.status(200).json({
      success: true,
      message: "Producteurs récupérés avec succès.",
      producteurs,
    });
  } catch (error) {
    handleError(error, "Récupération de tous les producteurs", req);

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des producteurs.",
      error: error.message,
    });
  }
});

// ---------------------------------------------------------------------------------------------------------- //

// @desc   Get a producteur by ID
// @route  GET /api/producteurs/:id
// @access Public
export const getProducteurById = catchAsync(async (req, res) => {
  try {
    // Getting the id of the producteur from the params
    const { id } = req.params;

    // Finding the producteur by id
    const producteur = await User.findById(id).select(
      "name email address role createdAt"
    );
    if (!producteur) {
      throw new AppError("Producteur non trouvé", 404);
    }
    logger.debug(
      `Producteur \x1b[1m${producteur.name}\x1b[0m récupéré avec succès`
    );
    res.status(200).json({
      success: true,
      message: `Producteur ${producteur.name} récupéré avec succès.`,
      producteur,
    });
  } catch (error) {
    handleError(error, "Récupération du producteur par ID", req);

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du producteur.",
      error: error.message,
    });
  }
});

// ---------------------------------------------------------------------------------------------------------- //
// @desc    Get all products of a producer
// @route   GET /api/producteurs/:id/products
// @access  Public
export const getProductsByProducteur = catchAsync(async (req, res) => {
  try {
    // Getting the id of the producteur from the params
    const { id } = req.params;

    // Finding the producteur by id
    const producteur = await User.findById(id).select(
      "name email address role"
    );
    if (!producteur) {
      throw new AppError("Producteur non trouvé", 404);
    }
    // Getting all products of the producteur
    const products = await Product.find({ producteurId: id })
      .select("name price description image category quantity createdAt")
      .sort({ createdAt: -1 });

    // If no products found, throw an error
    if (products.length === 0) {
      throw new AppError("Aucun produit trouvé pour ce producteur", 404);
    }

    // Logging the number of products retrieved
    logger.debug(
      `\x1b[1m${products.length}\x1b[0m produits récupérés pour le producteur ${producteur.name}`
    );

    // Sending the response with the producteur and products
    res.status(200).json({
      success: true,
      message: `Produits récupérés pour le producteur ${producteur.name} avec succès.`,
      producteur,
      products,
    });
  } catch (error) {
    handleError(error, "Récupération des produits du producteur", req);

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des produits du producteur.",
      error: error.message,
    });
  }
});
