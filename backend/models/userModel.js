import mongoose from "mongoose";
const Schema = mongoose.Schema;
import { logger } from "../services/logger.js";
import bcrypt from "bcrypt";
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

export default mongoose.model("User", userSchema);
