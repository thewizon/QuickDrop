const express = require("express");

const router = express.Router();

const {
  getAdminDashboard,
  getAgentDashboard,
  getCustomerDashboard,
} = require("../controllers/dashboardController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get(
  "/agent",
  authMiddleware,
  roleMiddleware("agent"),
  getAgentDashboard
);

router.get(
  "/customer",
  authMiddleware,
  roleMiddleware("customer"),
  getCustomerDashboard
);

router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("admin"),
  getAdminDashboard
);

module.exports = router;