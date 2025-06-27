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

    logger.debug(
      `\x1b[1m${producteurs.length}\x1b[0m produteurs récupérés`,
    )

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
