import mongoose from "mongoose";
const Schema = mongoose.Schema;
import { logger } from "../services/logger.js";
import { AppError } from "../utils/handleError.js";

const productSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    producteur: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: { type: Date, default: Date.now },
})