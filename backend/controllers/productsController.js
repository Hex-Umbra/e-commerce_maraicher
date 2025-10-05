import Product from "../models/productsModel.js";
import { logger } from "../services/logger.js";
import { uploadBufferToCloudinary, destroyByPublicId } from "../services/cloudinaryUpload.js";
import { catchAsync, handleError } from "../utils/handleError.js";

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Producteur)
export const createProduct = catchAsync(async (req, res) => {
  try {
    const body = { ...req.body, producteurId: req.user._id };

    // If a file is provided, upload to Cloudinary and set image fields
    const imageFile = req.files ? req.files.find(f => f.fieldname === 'image') : null;
    if (imageFile) {
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
    }
    // Else: legacy JSON path with body.image as URL (validation handled by Mongoose)

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
    const product = await Product.findById(req.params.id).populate(
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
    // Vérifie si le produit existe
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Produit introuvable." });
    }

    // Vérifie si l'utilisateur est bien le producteur du produit
    if (product.producteurId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à modifier ce produit." });
    }

    const updateData = { ...req.body, producteurId: req.user._id };
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
      // If no file and no new URL provided, don't modify image fields
      if (typeof req.body.image === "undefined") {
        delete updateData.image;
      }
      if (typeof req.body.imagePublicId === "undefined") {
        delete updateData.imagePublicId;
      }
    }

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


