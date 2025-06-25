import { handleError, handleMongooseError } from "../utils/handleError.js";

export const globalErrorHandler = (err, req, res, next) => {
  const handledError = handleMongooseError(err, "Express Route");

  const isDevelopment = process.env.NODE_ENV === "dev";

  handleError(handledError, "Global Error Handler", req);

  res.status(handledError.statusCode || 500).json({
    status: handledError.status || "error",
    message: isDevelopment ? handledError.message : "Something went wrong!",
    stack: isDevelopment ? handledError.stack : undefined,
    error: isDevelopment ? handledError.error : undefined,
  });
};
