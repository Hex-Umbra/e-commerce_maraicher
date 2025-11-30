import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { catchAsync, AppError } from "../utils/handleError.js";
import rateLimiter from "express-rate-limit";
import validator from "validator";
import { logger } from "../services/logger.js";
import emailService from "../services/emailService.js";

// Rate limiting middleware to prevent brute force attacks
export const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: "Trop de tentatives de connexion. Veuillez réessayer plus tard.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ----------------------------------------------------------------------------------------------------- //

// Function to sign JWT token
const signToken = (_id, role, name) => {
  return jwt.sign(
    { _id, role, name, iat: Math.floor(Date.now() / 1000) },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRATION,
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      algorithm: process.env.JWT_ALGORITHM,
    }
  );
};


// Helper to set secure cookie
const createSendToken = (user, statusCode, res, message) => {
  const token = signToken(user._id, user.role, user.name);

  const isProduction = process.env.NODE_ENV === "production";
  const isSecure = process.env.COOKIE_SECURE === "true" || isProduction;

  const cookieOptions = {
    httpOnly: true,
    secure: isSecure,
    sameSite: process.env.COOKIE_SAMESITE || (isSecure ? "None" : "Lax"),
    maxAge:
      parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res
    .status(statusCode)
    .cookie("jwt", token, cookieOptions)
    .json({
      success: true,
      message,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
};

// ----------------------------------------------------------------------------------------------------- //
// Function to validate user input
const validatorDataInputs = (data) => {
  const errorMessages = [];

  if (!data.name || data.name.trim() < 2) {
    errorMessages.push("Le nom doit contenir au moins 2 caractères.");
  }

  if (!data.email || !validator.isEmail(data.email)) {
    errorMessages.push("L'email est invalide.");
  }

  if (!data.password || data.password.length < 8) {
    errorMessages.push("Le mot de passe doit contenir au moins 8 caractères.");
  }

  if (
    data.password &&
    !validator.isStrongPassword(data.password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })
  ) {
    errorMessages.push(
      "Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule et un chiffre."
    );
  }
  return new AppError(errorMessages.join(" "), 400);
};

// ----------------------------------------------------------------------------------------------------- //

// User registration
export const register = catchAsync(async (req, res, next) => {
  const { name, email, password, address, role } = req.body;

  if (!name || !email || !password || !address ) {
    return next(new AppError("Tous les champs sont requis", 400));
  }

  // Validate user input
  const validationError = validatorDataInputs(req.body);
  if (validationError.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Vérifiez les données saisies",
      errors: validationError,
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "Un utilisateur avec cet email existe déjà",
    });
  }

  // User input sanitization
  const userData = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    address: address.trim(),
    role: role || "client",
  };
  if (address) {
    userData.address = validator.escape(address.trim());
  }

  // Create new user
  const newUser = await User.create(userData);
  
  // Generate email verification token
  const verificationToken = newUser.generateEmailVerificationToken();
  await newUser.save();

  // Send verification email
  try {
    await emailService.sendEmailVerification(newUser, verificationToken);
    logger.info(`Verification email sent to ${newUser.email}`);
  } catch (emailError) {
    logger.error(`Failed to send verification email: ${emailError.message}`);
    // Don't fail registration if email fails, but log the error
  }

  // Send token and response
  logger.info(
    `
    -----------------------------
    Nouvel utilisateur créé: \x1b[31m${newUser.name} \x1b[32m(${newUser.email}) \x1b[0m
    Rôle: \x1b[1m${newUser.role}\x1b
    Id: \x1b[33m${newUser._id}\x1b[0m
    Date: \x1b[36m${new Date().toLocaleString()}\x1b[0m
    Email Verification: \x1b[33mPending\x1b[0m
    -----------------------------
    `
  );

  res.status(201).json({
    success: true,
    message: "Utilisateur créé avec succès. Veuillez vérifier votre email pour activer votre compte.",
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isEmailVerified: newUser.isEmailVerified,
    },
  });
});

// ----------------------------------------------------------------------------------------------------- //

// Email verification
export const verifyEmail = catchAsync(async (req, res, next) => {
  const { token, email } = req.query;

  if (!token || !email) {
    return next(new AppError("Token et email sont requis", 400));
  }

  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return next(new AppError("Utilisateur non trouvé", 404));
  }

  // Get frontend URL for redirect
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  // Check if email is already verified
  if (user.isEmailVerified) {
    logger.info(`Email already verified for user: ${user.name} (${user.email})`);
    return res.redirect(`${frontendUrl}/login?verified=already&message=Email déjà vérifié`);
  }

  // Validate token using the method from User model (line 78-84 in userModel.js)
  if (!user.isEmailVerificationTokenValid(token)) {
    logger.error(`Invalid verification token for user: ${user.email}`);
    return res.redirect(`${frontendUrl}/login?verified=error&message=Token de vérification invalide ou expiré`);
  }

  // Mark email as verified and clear token
  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();

  logger.info(`Email verified successfully for user: ${user.name} (${user.email})`);

  // Redirect to login page with success message
  res.redirect(`${frontendUrl}/login?verified=success&message=Email vérifié avec succès ! Vous pouvez maintenant vous connecter.`);
});

// ----------------------------------------------------------------------------------------------------- //

// Resend email verification
export const resendEmailVerification = catchAsync(async (req, res, next) => {
  // Debug logging
  logger.info(`Resend verification request received`);
  logger.info(`Request body:`, req.body);
  
  // Check if req.body exists
  if (!req.body || Object.keys(req.body).length === 0) {
    logger.error("Request body is empty or undefined");
    return res.status(400).json({
      success: false,
      message: "Corps de la requête manquant. Veuillez fournir un email.",
    });
  }

  const { email } = req.body;

  if (!email) {
    logger.error("Email field is missing from request body");
    return res.status(400).json({
      success: false,
      message: "Email est requis",
    });
  }

  logger.info(`Looking for user with email: ${email}`);

  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    logger.error(`User not found with email: ${email}`);
    return res.status(404).json({
      success: false,
      message: "Utilisateur non trouvé",
    });
  }

  // Check if email is already verified
  if (user.isEmailVerified) {
    logger.info(`Email already verified for user: ${user.email}`);
    return res.status(400).json({
      success: false,
      message: "Email déjà vérifié",
    });
  }

  // Resend verification email
  try {
    logger.info(`Attempting to resend verification email to: ${user.email}`);
    await emailService.resendEmailVerification(user);
    
    logger.info(`Verification email resent successfully to ${user.email}`);
    
    res.status(200).json({
      success: true,
      message: "Email de vérification renvoyé avec succès",
    });
  } catch (error) {
    logger.error(`Failed to resend verification email: ${error.message}`);
    logger.error(`Error stack: ${error.stack}`);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'envoi de l'email",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ----------------------------------------------------------------------------------------------------- //

// User login
export const login = catchAsync(async (req, res, next) => {
  // Check if req.body exists
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message:
        "Veuillez fournir les informations de connexion",
    });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email et mot de passe sont requis", 400));
  }

  // Validate email format
  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "L'email est invalide",
    });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: " Utilisateur non trouvé" });
  }

const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Veuillez vérifier votre email avant de vous connecter. Vérifiez votre boîte de réception.",
      requiresVerification: true,
      email: user.email
    });
  }

  // Send token and response
  logger.info(
    `Le \x1b[1m${user.role}\x1b[0m \x1b[31m${user.name}\x1b[0m \x1b[32m(${user.email})\x1b[0m  s'est \x1b[47m\x1b[1m connecté \x1b[0m`
  );
  createSendToken(user, 200, res, "Connexion réussie");
});

// ----------------------------------------------------------------------------------------------------- //

// User logout
export const logout = (req, res) => {
  logger.info(
    `Le \x1b[1m${req.user.role}\x1b[0m \x1b[31m${req.user.name}\x1b[0m s'est \x1b[47m\x1b[1m déconnecté \x1b[0m`
  );

  const isProduction = process.env.NODE_ENV === "production";
  const isSecure = process.env.COOKIE_SECURE === "true" || isProduction;

  res
    .cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
      sameSite: process.env.COOKIE_SAMESITE || (isSecure ? "None" : "Lax"),
      secure: isSecure,
    })
    .status(200)
    .json({
      success: true,
      message: "Logged out successfully",
    });
};

// ----------------------------------------------------------------------------------------------------- //

// Get current user (me) - Check if user is authenticated
export const getMe = catchAsync(async (req, res, next) => {
  // If we reach here, user is authenticated (token was verified by middleware)
  const user = await User.findById(req.user._id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Utilisateur non trouvé",
    });
  }

  logger.info(
    `Le \x1b[1m${user.role}\x1b[0m \x1b[31m${user.name}\x1b[0m \x1b[32m(${user.email})\x1b[0m a vérifié son authentification`
  );

  res.status(200).json({
    success: true,
    message: "Utilisateur authentifié",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      address: user.address,
      createdAt: user.createdAt,
    },
  });
});

// ----------------------------------------------------------------------------------------------------- //

// Update user profile
export const updateProfile = catchAsync(async (req, res, next) => {
  const { name, email, address } = req.body;

  // Validate input
  if (!name && !email && !address) {
    return next(new AppError("Veuillez fournir au moins un champ à mettre à jour", 400));
  }

  // Build update object
  const updateData = {};

  // Validate and add fields to update
  if (name) {
    if (name.trim().length < 2) {
      return next(new AppError("Le nom doit contenir au moins 2 caractères", 400));
    }
    updateData.name = name.trim();
  }

  if (email) {
    if (!validator.isEmail(email)) {
      return next(new AppError("L'email est invalide", 400));
    }
    
    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      return next(new AppError("Cet email est déjà utilisé", 409));
    }
    
    updateData.email = email.trim().toLowerCase();
  }

  if (address) {
    if (address.trim().length < 4) {
      return next(new AppError("L'adresse doit contenir au moins 4 caractères", 400));
    }
    updateData.address = validator.escape(address.trim());
  }

  // Update user using findByIdAndUpdate to avoid triggering password hash pre-save hook
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { 
      new: true, // Return updated document
      runValidators: true, // Run schema validators
      select: '-password' // Exclude password from response
    }
  );

  if (!updatedUser) {
    return next(new AppError("Utilisateur non trouvé", 404));
  }

  logger.info(
    `Profil mis à jour pour \x1b[1m${updatedUser.role}\x1b[0m \x1b[31m${updatedUser.name}\x1b[0m \x1b[32m(${updatedUser.email})\x1b[0m`
  );

  res.status(200).json({
    success: true,
    message: "Profil mis à jour avec succès",
    user: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      address: updatedUser.address,
      createdAt: updatedUser.createdAt,
    },
  });
});
