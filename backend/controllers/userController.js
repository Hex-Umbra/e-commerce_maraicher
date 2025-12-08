import User from "../models/userModel.js";
import { catchAsync, AppError } from "../utils/handleError.js";
import { sanitizeUserInput, sanitizeObjectId } from "../utils/sanitize.js";
import validator from "validator";
import { logger } from "../services/logger.js";

// @desc    Create a new user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
export const createUser = catchAsync(async (req, res, next) => {
  const { name, email, password, address, role } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return next(new AppError("Le nom, l'email et le mot de passe sont requis", 400));
  }

  // Validate email format
  if (!validator.isEmail(email)) {
    return next(new AppError("L'email est invalide", 400));
  }

  // Validate password strength
  if (password.length < 8) {
    return next(new AppError("Le mot de passe doit contenir au moins 8 caractères", 400));
  }

  if (!validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })) {
    return next(new AppError(
      "Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial",
      400
    ));
  }

  // Sanitize user input
  const sanitizedData = sanitizeUserInput({ name, email, password, address, role });

  // Check if user already exists
  const existingUser = await User.findOne({ email: sanitizedData.email });
  if (existingUser) {
    return next(new AppError("Un utilisateur avec cet email existe déjà", 409));
  }

  // Validate role
  const validRoles = ["client", "producteur", "admin"];
  if (sanitizedData.role && !validRoles.includes(sanitizedData.role)) {
    return next(new AppError("Rôle invalide", 400));
  }

  // Prepare user data
  const userData = {
    name: sanitizedData.name,
    email: sanitizedData.email,
    password: sanitizedData.password,
    address: sanitizedData.address || "",
    role: sanitizedData.role || "client",
    isEmailVerified: true, // Admin-created users are automatically verified
  };

  // Create new user
  const newUser = await User.create(userData);

  logger.info(
    `New user created by admin: ${newUser.name} (${newUser.email}) - Role: ${newUser.role} - ID: ${newUser._id}`
  );

  res.status(201).json({
    success: true,
    message: "Utilisateur créé avec succès",
    data: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      address: newUser.address,
      isEmailVerified: newUser.isEmailVerified,
    },
  });
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({}).select("-password");
  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = catchAsync(async (req, res, next) => {
  // Sanitize and validate ObjectId
  const userId = sanitizeObjectId(req.params.id);
  if (!userId) {
    return next(new AppError("Invalid user ID", 400));
  }

  const user = await User.findById(userId).select("-password");

  if (user) {
    res.status(200).json({
      success: true,
      data: user,
    });
  } else {
    return next(new AppError("User not found", 404));
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = catchAsync(async (req, res, next) => {
  // Sanitize and validate ObjectId
  const userId = sanitizeObjectId(req.params.id);
  if (!userId) {
    return next(new AppError("Invalid user ID", 400));
  }

  const user = await User.findById(userId);

  if (user) {
    // Sanitize input data
    const sanitized = sanitizeUserInput(req.body);
    
    user.name = sanitized.name || user.name;
    user.email = sanitized.email || user.email;
    user.role = sanitized.role || user.role;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } else {
    return next(new AppError("User not found", 404));
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = catchAsync(async (req, res, next) => {
  // Sanitize and validate ObjectId
  const userId = sanitizeObjectId(req.params.id);
  if (!userId) {
    return next(new AppError("Invalid user ID", 400));
  }

  const user = await User.findById(userId);

  if (user) {
    await User.findByIdAndDelete(userId);
    res.status(200).json({ success: true, message: "User removed" });
  } else {
    return next(new AppError("User not found", 404));
  }
});
