import mongoose from "mongoose";
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        status: {
          type: String,
          enum: [ "En cours", "Prêt", "Livré", "Annulée" ],
          default: "En cours",
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["En cours", "Complète", "Partiellement complète" ,"Annulée"],
      default: "En cours",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
