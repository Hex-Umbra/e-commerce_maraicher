import User from "../models/userModel.js";
import { catchAsync, AppError } from "../utils/handleError.js";
import { sanitizeUserInput, sanitizeObjectId } from "../utils/sanitize.js";

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
