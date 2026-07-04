const Order = require("../models/Order");
const User = require("../models/User");

const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalOrders,
      totalCustomers,
      totalAgents,
      deliveredOrders,
      assignedOrders,
      pickedUpOrders,
      failedOrders,
      cancelledOrders,
      pendingOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "agent" }),
      Order.countDocuments({ orderStatus: "delivered" }),
      Order.countDocuments({ orderStatus: "assigned" }),
      Order.countDocuments({ orderStatus: "picked_up" }),
      Order.countDocuments({ orderStatus: "failed" }),
      Order.countDocuments({ orderStatus: "cancelled" }),
      Order.countDocuments({
        orderStatus: {
          $in: ["created", "assigned", "picked_up", "in_transit", "out_for_delivery", "rescheduled"],
        },
      }),
    ]);

    const revenueResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$deliveryCharge",
          },
        },
      },
    ]);

    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.status(200).json({
      success: true,
      message: "Dashboard fetched successfully.",
      data: {
        totalOrders,
        totalCustomers,
        totalAgents,
        pendingOrders,
        assignedOrders,
        pickedUpOrders,
        deliveredOrders,
        failedOrders,
        cancelledOrders,
        totalRevenue,
      },
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
const getAgentDashboard = async (req, res) => {
  try {
    const assignedOrders = await Order.countDocuments({
      assignedAgent: req.user.id,
    });

    const pickedUpOrders = await Order.countDocuments({
      assignedAgent: req.user.id,
      orderStatus: "picked_up",
    });

    const outForDeliveryOrders = await Order.countDocuments({
      assignedAgent: req.user.id,
      orderStatus: "out_for_delivery",
    });

    const deliveredOrders = await Order.countDocuments({
      assignedAgent: req.user.id,
      orderStatus: "delivered",
    });

    res.status(200).json({
      success: true,
      message: "Agent dashboard fetched successfully.",
      data: {
        assignedOrders,
        pickedUpOrders,
        outForDeliveryOrders,
        deliveredOrders,
      },
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getCustomerDashboard = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({
      customer: req.user.id,
    });

    const pendingOrders = await Order.countDocuments({
      customer: req.user.id,
      orderStatus: {
        $in: ["created", "assigned", "picked_up", "out_for_delivery"],
      },
    });

    const deliveredOrders = await Order.countDocuments({
      customer: req.user.id,
      orderStatus: "delivered",
    });

    const cancelledOrders = await Order.countDocuments({
      customer: req.user.id,
      orderStatus: "cancelled",
    });

    const spending = await Order.aggregate([
      {
        $match: {
          customer: req.user._id,
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: {
            $sum: "$deliveryCharge",
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Customer dashboard fetched successfully.",
      data: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        totalSpent:
          spending.length > 0 ? spending[0].totalSpent : 0,
      },
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  getAdminDashboard,
  getAgentDashboard,
  getCustomerDashboard,
};