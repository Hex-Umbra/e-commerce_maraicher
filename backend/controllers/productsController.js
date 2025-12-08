import Product from "../models/productsModel.js";
import { logger } from "../services/logger.js";
import { uploadBufferToCloudinary, destroyByPublicId } from "../services/cloudinaryUpload.js";
import { catchAsync, handleError, AppError } from "../utils/handleError.js";
import { sanitizeProductInput, sanitizeObjectId } from "../utils/sanitize.js";

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Producteur)
export const createProduct = catchAsync(async (req, res) => {
  try {
    // Sanitize product inputs
    const sanitizedBody = sanitizeProductInput(req.body);
    const body = { ...sanitizedBody, producteurId: req.user._id };

    // Enforce file upload for image
    const imageFile = req.files ? req.files.find(f => f.fieldname === 'image') : null;
    if (!imageFile) {
      return res.status(400).json({
        message: "Le fichier image est requis. Veuillez téléverser une image.",
      });
    }
    const folder = `products/${req.user._id}`;
    try {
      const result = await uploadBufferToCloudinary(imageFile.buffer, folder);
      body.image = result.secure_url;
      body.imagePublicId = result.public_id;
    } catch (cloudErr) {
      handleError(cloudErr, "Upload image (createProduct)", req);
      return res.status(502).json({
        message: "Erreur lors du téléversement de l'image.",
        error: cloudErr.message,
      });
    }

    const newProduct = new Product(body);
    await newProduct.save();

    // Log de la création réussie du produit
    logger.info(`Produit créé avec succès : ${newProduct._id}`, {
      userId: req.user._id,
      productId: newProduct._id,
      productName: newProduct.name,
    });

    res.status(201).location(`/api/products/${newProduct._id}`).json({
      message: "Produit créé avec succès.",
      product: newProduct,
    });
  } catch (error) {
    handleError(error, "Création de produit", req);

    res.status(500).json({
      message: "Erreur lors de la création du produit.",
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

    // Log de la récupération des produits
    logger.debug(`\x1b[1m${products.length}\x1b[0m produits récupérés`, {
      userId: req.user ? req.user._id : "anonymous",
    });

    res.status(200).json({
      message: "Produits récupérés avec succès.",
      products,
    });
  } catch (error) {
    handleError(error, "Récupération de tous les produits", req);

    res.status(500).json({
      message: "Erreur lors de la récupération des produits.",
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
    // Sanitize and validate ObjectId
    const productId = sanitizeObjectId(req.params.id);
    if (!productId) {
      return res.status(400).json({ message: "ID de produit invalide." });
    }

    const product = await Product.findById(productId).populate(
      "producteurId",
      "name email"
    );

    if (!product) {
      return res.status(404).json({ message: "Produit introuvable." });
    }

    // Log en développement de la récupération réussie du produit
    logger.debug(
      `Produit récupéré avec succès : ${product.name} - ${product._id}`,
      {
        userId: req.user ? req.user._id : "anonymous",
        productId: product._id,
        productName: product.name,
      }
    );

    res.status(200).json({
      message: "Produit récupéré avec succès.",
      product,
    });
  } catch (error) {
    handleError(error, "Récupération d'un produit par ID", req);

    res.status(500).json({
      message: "Erreur lors de la récupération du produit.",
    });
  }
});

// -------------------------------------------------------------------------------------- //
// @desc    Update a product by ID
// @route   PUT /api/products/:id
// @access  Private (Producteur)
export const updateProduct = catchAsync(async (req, res) => {
  try {
    // Sanitize and validate ObjectId
    const productId = sanitizeObjectId(req.params.id);
    if (!productId) {
      return res.status(400).json({ message: "ID de produit invalide." });
    }

    // Vérifie si le produit existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Produit introuvable." });
    }

    // Vérifie si l'utilisateur est bien le producteur du produit
    if (product.producteurId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à modifier ce produit." });
    }

    // Sanitize incoming product data
    const sanitizedData = sanitizeProductInput(req.body);
    const updateData = { ...sanitizedData, producteurId: req.user._id };
    let newUploadResult = null;

    const imageFile = req.files ? req.files.find(f => f.fieldname === 'image') : null;
    if (imageFile) {
      // Upload new image
      const folder = `products/${req.user._id}`;
      try {
        newUploadResult = await uploadBufferToCloudinary(
          imageFile.buffer,
          folder
        );
        updateData.image = newUploadResult.secure_url;
        updateData.imagePublicId = newUploadResult.public_id;
      } catch (cloudErr) {
        handleError(cloudErr, "Upload image (updateProduct)", req);
        return res.status(502).json({
          message: "Erreur lors du téléversement de la nouvelle image.",
          error: cloudErr.message,
        });
      }
    } else {
      // Forbid changing image via URL or direct fields when no file is provided
      if (typeof req.body.image !== "undefined" || typeof req.body.imagePublicId !== "undefined") {
        return res.status(400).json({
          message: "La modification de l'image doit se faire via un fichier téléversé.",
        });
      }
      // No file provided -> do not touch image fields
      delete updateData.image;
      delete updateData.imagePublicId;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ message: "Produit introuvable après mise à jour." });
    }

    // After successful update, if we uploaded a new image and an old publicId exists, destroy old asset
    if (
      newUploadResult &&
      product.imagePublicId &&
      product.imagePublicId !== newUploadResult.public_id
    ) {
      try {
        await destroyByPublicId(product.imagePublicId);
      } catch (destroyErr) {
        handleError(destroyErr, "Destroy old image (updateProduct)", req);
        // Do not fail the request if deletion fails
      }
    }

    // Log de la mise à jour réussie du produit
    logger.info(`Produit mis à jour avec succès : ${updatedProduct._id}`, {
      userId: req.user._id,
      productId: updatedProduct._id,
      productName: updatedProduct.name,
    });

    // Répond avec le produit mis à jour et un code 200
    res.status(200).json({
      message: "Produit mis à jour avec succès.",
      updatedProduct,
    });
  } catch (error) {
    // Log de l'erreur pour le débogage
    handleError(error, "Mise à jour du produit", req);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du produit.",
      error: error.message,
    });
  }
});

// -------------------------------------------------------------------------------------- //
// @desc    Delete a product by ID
// @route   DELETE /api/products/:id
// @access  Private (Producteur)
export const deleteProduct = catchAsync(async (req, res) => {
  try {
    // Récupère le produit à supprimer
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Produit introuvable." });
    }
    // Vérifie si l'utilisateur est le producteur du produit
    if (product.producteurId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à supprimer ce produit." });
    }

    // Tente de supprimer l'actif Cloudinary s'il existe
    if (product.imagePublicId) {
      try {
        await destroyByPublicId(product.imagePublicId);
      } catch (destroyErr) {
        handleError(destroyErr, "Destroy image (deleteProduct)", req);
        // Ne pas échouer la suppression DB si Cloudinary échoue
      }
    }

    // Supprime le produit
    await Product.findByIdAndDelete(req.params.id);
    // Log de la suppression réussie du produit
    logger.info(`Produit supprimé avec succès : ${product._id}`, {
      userId: req.user._id,
      productId: product._id,
      productName: product.name,
    });
    // Répond avec un message de succès
    res.status(200).json({
      message: "Produit supprimé avec succès.",
    });
  } catch (error) {
    // Log de l'erreur pour le débogage
    handleError(error, "Suppression du produit", req);
    res.status(500).json({
      message: "Erreur lors de la suppression du produit.",
      error: error.message,
    });
  }
});

// -------------------------------------------------------------------------------------- //
// @desc    Create a new product by admin
// @route   POST /api/products/admin
// @access  Private (Admin)
export const adminCreateProduct = catchAsync(async (req, res) => {
    const body = { ...req.body };

    if (!body.producteurId) {
        return next(new AppError("Producteur ID is required", 400));
    }
    
    const newProduct = new Product(body);
    await newProduct.save();

    logger.info(`Product created by admin: ${newProduct._id}`, {
      userId: req.user._id,
      productId: newProduct._id,
      productName: newProduct.name,
    });

    res.status(201).json({
      message: "Product created successfully by admin.",
      product: newProduct,
    });
});

// @desc    Update a product by ID by admin
// @route   PUT /api/products/admin/:id
// @access  Private (Admin)
export const adminUpdateProduct = catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Produit introuvable." });
    }

    const updateData = { ...req.body };

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ message: "Produit introuvable après mise à jour." });
    }

    logger.info(`Product updated by admin: ${updatedProduct._id}`, {
      userId: req.user._id,
      productId: updatedProduct._id,
      productName: updatedProduct.name,
    });

    res.status(200).json({
      message: "Product updated successfully by admin.",
      updatedProduct,
    });
});

// @desc    Delete a product by ID by admin
// @route   DELETE /api/products/admin/:id
// @access  Private (Admin)
export const adminDeleteProduct = catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Produit introuvable." });
    }

    if (product.imagePublicId) {
      try {
        await destroyByPublicId(product.imagePublicId);
      } catch (destroyErr) {
        handleError(destroyErr, "Destroy image (adminDeleteProduct)", req);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    
    logger.info(`Product deleted by admin: ${product._id}`, {
      userId: req.user._id,
      productId: product._id,
      productName: product.name,
    });
    
    res.status(200).json({
      message: "Product deleted successfully by admin.",
    });
});
