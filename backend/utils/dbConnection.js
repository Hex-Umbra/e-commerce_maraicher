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
    logger.info(`
      ----- Connection à MongoDB -----

      ✅ Connexion à MongoDB réussie
      📊 Base de données: ${conn.connection.name}
      🌍 Host: ${conn.connection.host}:${conn.connection.port}
      
      ------------------------------
      `);

    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(`
        ----- Démarrage du serveur Express -----

        🚀 Serveur démarré ici : \x1b[31mhttp://localhost:${PORT}\x1b[0m
        🔗 Environment: ${process.env.NODE_ENV || "dev"}

        ------------------------------
        `);
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
