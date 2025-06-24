import mongoose from "mongoose";
import { logger } from "../services/logger.js";
import { handleError } from "./handleError.js";
import dotenv from "dotenv";
import { app } from "../server.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

export const connectDB = async () => {
  try {
    // Connection to MongoDB
    const conn = await mongoose.connect(MONGO_URI);

    // Log connection details
    logger.info("✅ Connexion à MongoDB réussie");
    logger.info(`📊 Base de données: ${conn.connection.name}`);
    logger.info(`🌍 Host: ${conn.connection.host}:${conn.connection.port}`);

    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Serveur démarré sur le port ${PORT}`);
      logger.info(`🔗 Environment: ${process.env.NODE_ENV || "dev"}`);
    });

    // Handle server errors
    server.on("error", (error) => {
      handleError(error, "Server Startup");
      process.exit(1);
    });

    return server;
  } catch (error) {
    handleError(error, "MongoDB Connection");
    logger.error(
      "💥 Impossible de se connecter à MongoDB. Arrêt du serveur..."
    );
    process.exit(1);
  }
};
