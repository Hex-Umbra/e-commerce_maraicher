import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./utils/dbConnection.js";

dotenv.config();

export const app = express();

app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("API Ecommerce Maraîcher est en ligne 🚀");
});

// ---------------------------------------------------------------------------------------------- //
// Connect to MongoDB + Server start
connectDB();
