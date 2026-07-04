const express = require("express");

const router = express.Router();

const {
  createAgent,
  getAllAgents,
  updateAgentZone,
  updateMyStatus,
} = require("../controllers/agentController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, roleMiddleware("admin"), createAgent);
router.get("/", authMiddleware, roleMiddleware("admin"), getAllAgents);
router.patch("/:id/zone", authMiddleware, roleMiddleware("admin"), updateAgentZone);
router.patch("/me/status", authMiddleware, roleMiddleware("agent"), updateMyStatus);

module.exports = router;
