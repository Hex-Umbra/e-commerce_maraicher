import validator from "validator";
import mongoose from "mongoose";

/**
 * Sanitize string input to prevent XSS attacks
 * @param {string} input - The input string to sanitize
 * @param {object} options - Sanitization options
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (input, options = {}) => {
  if (typeof input !== "string") {
    return input;
  }

  let sanitized = input.trim();

  // Remove HTML tags and escape special characters
  if (options.allowHtml) {
    // Only escape dangerous characters but allow some HTML
    sanitized = validator.escape(sanitized);
  } else {
    // Strip all HTML tags
    sanitized = validator.stripLow(sanitized);
    sanitized = validator.escape(sanitized);
  }

  // Optional: Limit length
  if (options.maxLength) {
    sanitized = sanitized.slice(0, options.maxLength);
  }

  return sanitized;
};

/**
 * Sanitize email input
 * @param {string} email - The email to sanitize
 * @returns {string} - Sanitized and normalized email
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== "string") {
    return email;
  }

  // Normalize and sanitize email
  let sanitized = validator.normalizeEmail(email, {
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
    outlookdotcom_remove_subaddress: false,
    yahoo_remove_subaddress: false,
    icloud_remove_subaddress: false,
  });

  return sanitized ? sanitized.toLowerCase().trim() : email.toLowerCase().trim();
};

/**
 * Sanitize object to prevent NoSQL injection
 * Removes any MongoDB operators from object keys
 * @param {object} obj - The object to sanitize
 * @returns {object} - Sanitized object
 */
export const sanitizeObject = (obj) => {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  const sanitized = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Remove MongoDB operators (keys starting with $)
      if (key.startsWith("$")) {
        continue;
      }

      // Recursively sanitize nested objects
      if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
        sanitized[key] = sanitizeObject(obj[key]);
      } else if (typeof obj[key] === "string") {
        sanitized[key] = obj[key];
      } else {
        sanitized[key] = obj[key];
      }
    }
  }

  return sanitized;
};

/**
 * Validate and sanitize MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {string|null} - Valid ObjectId or null
 */
export const sanitizeObjectId = (id) => {
  if (!id) {
    return null;
  }

  // Check if it's a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  return id.toString().trim();
};

/**
 * Sanitize array of strings
 * @param {array} arr - Array of strings to sanitize
 * @param {object} options - Sanitization options
 * @returns {array} - Sanitized array
 */
export const sanitizeArray = (arr, options = {}) => {
  if (!Array.isArray(arr)) {
    return arr;
  }

  return arr.map((item) => {
    if (typeof item === "string") {
      return sanitizeString(item, options);
    }
    return item;
  });
};

/**
 * Sanitize number input
 * @param {any} input - The input to sanitize as number
 * @param {object} options - Options { min, max, default }
 * @returns {number} - Sanitized number
 */
export const sanitizeNumber = (input, options = {}) => {
  const num = Number(input);

  if (isNaN(num)) {
    return options.default !== undefined ? options.default : 0;
  }

  if (options.min !== undefined && num < options.min) {
    return options.min;
  }

  if (options.max !== undefined && num > options.max) {
    return options.max;
  }

  return num;
};

/**
 * Comprehensive input sanitization for user registration/profile
 * @param {object} data - User data to sanitize
 * @returns {object} - Sanitized user data
 */
export const sanitizeUserInput = (data) => {
  const sanitized = {};

  if (data.name) {
    sanitized.name = sanitizeString(data.name, { maxLength: 100 });
  }

  if (data.email) {
    sanitized.email = sanitizeEmail(data.email);
  }

  if (data.password) {
    // Don't sanitize password (it will be hashed)
    sanitized.password = data.password;
  }

  if (data.address) {
    sanitized.address = sanitizeString(data.address, { maxLength: 500 });
  }

  if (data.role) {
    // Only allow specific roles
    const allowedRoles = ["client", "producteur", "admin"];
    sanitized.role = allowedRoles.includes(data.role) ? data.role : "client";
  }

  return sanitized;
};

/**
 * Sanitize product input
 * @param {object} data - Product data to sanitize
 * @returns {object} - Sanitized product data
 */
export const sanitizeProductInput = (data) => {
  const sanitized = {};

  if (data.name) {
    sanitized.name = sanitizeString(data.name, { maxLength: 200 });
  }

  if (data.description) {
    sanitized.description = sanitizeString(data.description, { maxLength: 2000 });
  }

  if (data.category) {
    sanitized.category = sanitizeString(data.category, { maxLength: 50 });
  }

  if (data.price !== undefined) {
    sanitized.price = sanitizeNumber(data.price, { min: 0, default: 0 });
  }

  if (data.quantity !== undefined) {
    sanitized.quantity = sanitizeNumber(data.quantity, { min: 0, default: 0 });
  }

  if (data.image) {
    sanitized.image = data.image; // URL from cloudinary, already safe
  }

  if (data.imagePublicId) {
    sanitized.imagePublicId = data.imagePublicId;
  }

  if (data.producteurId) {
    sanitized.producteurId = sanitizeObjectId(data.producteurId);
  }

  return sanitized;
};

/**
 * Sanitize comment input
 * @param {object} data - Comment data to sanitize
 * @returns {object} - Sanitized comment data
 */
export const sanitizeCommentInput = (data) => {
  const sanitized = {};

  if (data.comment) {
    sanitized.comment = sanitizeString(data.comment, { maxLength: 1000 });
  }

  if (data.rating !== undefined) {
    sanitized.rating = sanitizeNumber(data.rating, { min: 1, max: 5, default: 1 });
  }

  if (data.ProducteurId) {
    sanitized.ProducteurId = sanitizeObjectId(data.ProducteurId);
  }

  return sanitized;
};

/**
 * Sanitize support message input
 * @param {object} data - Support message data to sanitize
 * @returns {object} - Sanitized support data
 */
export const sanitizeSupportInput = (data) => {
  const sanitized = {};

  if (data.subject) {
    sanitized.subject = sanitizeString(data.subject, { maxLength: 200 });
  }

  if (data.object) {
    sanitized.object = sanitizeString(data.object, { maxLength: 200 });
  }

  if (data.title) {
    sanitized.title = sanitizeString(data.title, { maxLength: 200 });
  }

  if (data.message) {
    sanitized.message = sanitizeString(data.message, { maxLength: 5000 });
  }

  return sanitized;
};
