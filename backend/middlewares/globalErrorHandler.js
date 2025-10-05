import { AppError, handleError, handleMongooseError } from "../utils/handleError.js";

export const globalErrorHandler = (err, req, res, next) => {
  // Normalize Multer (upload) errors to clear 400 responses
  let normalized = err;
  if (err && err.name === "MulterError") {
    let message = "Erreur d'upload de fichier.";
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        message = "Le fichier est trop volumineux (max 5MB).";
        break;
      case "LIMIT_FILE_COUNT":
        message = "Trop de fichiers envoyés.";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = "Type de fichier non autorisé. Types permis: JPEG, PNG, WEBP, GIF, SVG.";
        break;
      default:
        message = err.message || message;
    }
    normalized = new AppError(message, 400);
  }

  // Handle common Mongoose errors (validation, cast, duplicate)
  const handledError = handleMongooseError(normalized, "Express Route");

  const isDevelopment = process.env.NODE_ENV === "dev";

  handleError(handledError, "Global Error Handler", req);

  res.status(handledError.statusCode || 500).json({
    status: handledError.status || "error",
    message: isDevelopment ? handledError.message : "Something went wrong!",
    stack: isDevelopment ? handledError.stack : undefined,
    error: isDevelopment ? handledError.error : undefined,
  });
};
