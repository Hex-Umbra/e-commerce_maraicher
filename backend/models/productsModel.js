import mongoose from "mongoose";
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0, default: 0 },
  image: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  producteurId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Product", productSchema);
