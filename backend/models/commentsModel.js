import mongoose from "mongoose";
import { Schema } from "mongoose";

const commentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  ProducteurId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  comment: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;