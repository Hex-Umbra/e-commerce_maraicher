import express from "express";
const router = express.Router();
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyRole } from "../middlewares/verifyRole.js";

router
  .route("/")
  .get(verifyToken, verifyRole("admin"), getAllUsers)
  .post(verifyToken, verifyRole("admin"), createUser);

router
  .route("/:id")
  .get(verifyToken, verifyRole("admin"), getUserById)
  .put(verifyToken, verifyRole("admin"), updateUser)
  .delete(verifyToken, verifyRole("admin"), deleteUser);

export default router;
