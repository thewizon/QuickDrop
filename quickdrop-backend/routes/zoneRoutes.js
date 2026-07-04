const express = require("express");

const router = express.Router();

const {
  createZone,
  getAllZones,
  getZoneById,
  updateZone,
  deleteZone,
} = require("../controllers/zoneController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  createZone
);

router.get("/", authMiddleware, getAllZones);

router.get("/:id", authMiddleware, getZoneById);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateZone
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteZone
);

module.exports = router;