import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();
import { logger } from "./logger.js";

/**
 * Cloudinary configuration singleton
 * Uses environment variables:
 * - CLOUDINARY_CLOUD_NAME
 * - CLOUDINARY_API_KEY
 * - CLOUDINARY_API_SECRET
 *
 * We avoid throwing at boot in Phase 1 to keep the app starting even without credentials.
 * Later phases that actually call Cloudinary should handle missing config accordingly.
 */
const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  logger.warn(
    "Cloudinary env vars are not fully set. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to enable uploads."
  );
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME || undefined,
  api_key: CLOUDINARY_API_KEY || undefined,
  api_secret: CLOUDINARY_API_SECRET || undefined,
  secure: true,
});

export default cloudinary;
