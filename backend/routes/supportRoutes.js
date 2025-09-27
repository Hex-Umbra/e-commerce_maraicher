import express from "express";
import { sendContactMessage } from "../controllers/supportController.js";

const supportRouter = express.Router();

// POST /api/support/contact
supportRouter.post("/contact", sendContactMessage);

export default supportRouter;
