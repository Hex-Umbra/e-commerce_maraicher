import { logger } from "../services/logger.js";

export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

// -------------------------------------------------------------------------------------------------------
// Error handling function
// This function logs the error details and returns the error object.
// It can be used in middleware or route handlers to handle errors consistently.
// It also includes a context parameter to provide additional information about where the error occurred.

export const handleError = (err, context = "", req = null) => {
  const timestamp = new Date().toISOString();

  //  Log the error details
  const logEntry = `
    \n--- Error Log ---
   - ❌ [${context}]
   - Message: ${err.message}
   - Status: ${err.statusCode || "Unknown"}
   - ${req ? `Route: ${req.method} ${req.originalUrl}\n` : ""}
   - Stack: ${err.stack}
---`;

  // Log the error using the logger
  if (process.env.NODE_ENV === "dev") {
    logger.error(logEntry);
  } else {
    logger.error(
      `❌[${context}] Message: ${err.message} 
      - Status: ${err.statusCode || "Unknown"}`
    );
  }

  return err;
};

// -------------------------------------------------------------------------------------------------------
// Handle Mongoose errors specifically
// This function checks for common Mongoose error types and formats the error message accordingly.
// It returns an AppError object with a specific status code and message for validation errors

export const handleMongooseError = (err, context = "", req = null) => {
  let message = err.message;
  let statusCode = 500;

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((val) => val.message);
    message = `Validation Error: ${errors.join(", ")}`;
    statusCode = 400;
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field: ${field}`;
    statusCode = 400;
  } else if (err.name === "CastError") {
    message = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
  }

  if (
    err.name === "ValidationError" ||
    err.code === 11000 ||
    err.name === "CastError"
  ) {
    const appError = new AppError(message, statusCode);
    return handleError(appError, context, req);
  }

  return err;
};

// Catch async errors and pass them to Express error middleware
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};


