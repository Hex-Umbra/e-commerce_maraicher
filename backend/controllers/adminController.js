const userModel = require("../models/userModel");
const productsModel = require("../models/productsModel");
const orderModel = require("../models/orderModel");

const getDashboardStats = async (req, res) => {
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

module.exports = {
  getDashboardStats,
};
