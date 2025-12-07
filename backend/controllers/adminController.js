import userModel from "../models/userModel.js";
import productsModel from "../models/productsModel.js";
import orderModel from "../models/orderModel.js";

export const getDashboardStats = async (req, res) => {
  try {
    const usersCount = await userModel.countDocuments();
    const productsCount = await productsModel.countDocuments();
    const ordersCount = await orderModel.countDocuments();

    res.status(200).json({
      users: usersCount,
      products: productsCount,
      orders: ordersCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Error getting dashboard stats", error });
  }
};
