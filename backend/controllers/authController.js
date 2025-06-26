import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { catchAsync, AppError } from "../utils/handleError.js";
import rateLimiter from "express-rate-limit";
import validator from "validator";
import { logger } from "../services/logger.js";

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

// ----------------------------------------------------------------------------------------------------- //

// Helper to set secure cookie
const createSendToken = (user, statusCode, res, message) => {
  const token = signToken(user._id, user.role, user.name);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
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

  if (!name || !email || !password || !address || !role) {
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
  await newUser.save();

  // Send token and response
  logger.info(
    `
    -----------------------------
    Nouvel utilisateur créé: \x1b[31m${newUser.name} \x1b[32m(${newUser.email})
    -----------------------------
    `
  );

  createSendToken(newUser, 201, res, "Utilisateur créé avec succès");
});

// ----------------------------------------------------------------------------------------------------- //

// User login
export const login = catchAsync(async (req, res, next) => {
  // Check if req.body exists
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message:
        "Request body is missing or empty. Please ensure you are sending JSON data with Content-Type: application/json header.",
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

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ success: false, message: "User not found" });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  // Send token and response
  logger.info(
    `Le \x1b[1m${user.role}\x1b[0m \x1b[31m${user.name}\x1b[0m \x1b[32m(${user.email})\x1b[0m  s'est \x1b[47m\x1b[1m connecté \x1b[0m`
  );
  createSendToken(user, 200, res, "Logged in successfully");
});

// ----------------------------------------------------------------------------------------------------- //

// User logout
export const logout = (req, res) => {
  logger.info(
    `Le \x1b[1m${req.user.role}\x1b[0m \x1b[31m${req.user.name}\x1b[0m s'est \x1b[47m\x1b[1m déconnecté \x1b[0m`
  );

  res
    .cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
    })
    .status(200)
    .json({
      success: true,
      message: "Logged out successfully",
    });
};
