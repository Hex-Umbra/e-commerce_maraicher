import mongoose from "mongoose";
const Schema = mongoose.Schema;
import { logger } from "../services/logger.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { AppError } from "../utils/handleError.js";

const userSchema = new Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "producteur", "client"],
    default: "client",
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    default: null,
  },
  emailVerificationExpires: {
    type: Date,
    default: null,
  },
  cart: [
    {
      product: { type: Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 },
      price: { type: Number, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  // Only hash if password is new or modified
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(AppError(error, 400));
  }
});

// Password comparison method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    if (!this.password || !candidatePassword) {
      throw new AppError("Password not set", 400);
    }

    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    logger.error("Error comparing password:", error);
    return false;
  }
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function () {
  // Generate random token (this will be sent in email)
  const rawToken = crypto.randomBytes(32).toString('hex');
  
  // Hash the token before storing in database
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  
  // Store hashed token and expiration (24 hours from now)
  this.emailVerificationToken = hashedToken;
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  // Return the raw token (to be sent in email)
  return rawToken;
};

// Check if email verification token is valid
userSchema.methods.isEmailVerificationTokenValid = function (rawToken) {
  // Hash the provided token to compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  
  return (
    this.emailVerificationToken === hashedToken &&
    this.emailVerificationExpires &&
    this.emailVerificationExpires > new Date()
  );
};

export default mongoose.model("User", userSchema);
