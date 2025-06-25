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
      logger.info(`🚀 Serveur démarré ici : http://localhost:${PORT}`);
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
// -------------------------------------------------------------------------------------------------------
// Graceful shutdown function
// This function handles graceful shutdown of the server when it receives termination signals.
// It closes the MongoDB connection and logs the shutdown process.
const gracefulShutdown = (signal) => {
  console.log(`\n📴 Signal ${signal} reçu. Arrêt gracieux du serveur...`);

  mongoose.connection.close(() => {
    console.log("🔌 Connexion MongoDB fermée");
    console.log("👋 Serveur arrêté proprement");
    process.exit(0);
  });

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
};
