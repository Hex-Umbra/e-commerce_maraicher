import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { logger } from "../services/logger.js";

export const verifyToken = async (req, res, next) => {
  const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];

  if (!token) {
    logger.warn("Token manquant dans les cookies");
    return res
      .status(401)
      .json({ message: "Accès non autorisé, token manquant" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.debug(`Decoded JWT: ${JSON.stringify(decoded)}`);

    const freshUser = await User.findById(decoded._id);

    if (!freshUser) {
      logger.warn(`User not found for decoded ID: ${decoded._id}`);
      return res.status(401).json({ message: "Utilisateur du token non trouvé" });
    }

    req.user = freshUser;
    logger.debug(`Fresh user from DB: ID=${freshUser._id}, Role=${freshUser.role}`);
    next();
  } catch (error) {
    logger.error("Erreur lors de la vérification du token");
    
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
