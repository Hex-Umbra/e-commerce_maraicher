import cloudinary from "./cloudinary.js";
import streamifier from "streamifier";

/**
 * Upload a buffer to Cloudinary using upload_stream.
 * Returns an object containing at least: secure_url, public_id
 *
 * @param {Buffer} buffer - The image file buffer (from multer memoryStorage)
 * @param {string} folder - Cloudinary folder path (e.g., "products/<userId>")
 * @param {object} [options] - Additional Cloudinary upload options
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
export function uploadBufferToCloudinary(buffer, folder, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: "image",
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

/**
 * Destroy an asset by its Cloudinary public_id.
 *
 * @param {string} publicId
 * @returns {Promise<any>}
 */
export function destroyByPublicId(publicId) {
  return cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}
