import jwt from "jsonwebtoken";
import { logger } from "../services/logger.js";

export const verifyToken = (req, res, next) => {
  // Check if the token is present in the cookies or in the Authorization header
  // The token can be sent as a Bearer token in the Authorization header or as a cookie named 'jwt'
  // If the token is found, it will be used to verify the users' authentication status
  const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];

  // If the token is not present, return an error response
  if (!token) {
    logger.warn("Token manquant dans les cookies");

    return res
      .status(401)
      .json({ message: "Accès non autorisé, token manquant" });
  }

  // Verify the token using the secret key
  // If the token is valid, attach the decoded user information to the request object
  // If the token is invalid or expired, return an error response
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error("Erreur lors de la vérification du token");
    
    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {

      logger.warn("Token expiré");
    } else if (error.name === "JsonWebTokenError") {

      logger.warn("Token invalide");
    }

    return res.status(403).json({
      message: "Token invalide ou expiré, veuillez vous reconnecter",
      error: error.message,
    });
  }
};
