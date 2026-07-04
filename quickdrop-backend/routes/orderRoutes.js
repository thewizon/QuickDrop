const express = require("express");

const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  assignAgent,
  autoAssign,
  updateOrderStatus,
  rescheduleOrder,
  getOrderTracking,
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Customer (or admin on behalf of a customer)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("customer", "admin"),
  createOrder
);

router.get(
  "/my-orders",
  authMiddleware,
  roleMiddleware("customer", "agent"),
  getMyOrders
);

// Admin - list all + filter by status/zone/agent via query params
router.get("/", authMiddleware, roleMiddleware("admin"), getAllOrders);

router.patch(
  "/:id/assign-agent",
  authMiddleware,
  roleMiddleware("admin"),
  assignAgent
);

router.patch(
  "/:id/auto-assign",
  authMiddleware,
  roleMiddleware("admin"),
  autoAssign
);

router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin", "agent"),
  updateOrderStatus
);

router.patch(
  "/:id/reschedule",
  authMiddleware,
  roleMiddleware("admin", "customer"),
  rescheduleOrder
);

// Tracking (any authenticated party involved with the order)
router.get("/:id/tracking", authMiddleware, getOrderTracking);

// Common - single order lookup, keep last so it doesn't shadow the above
router.get("/:id", authMiddleware, getOrderById);

module.exports = router;
