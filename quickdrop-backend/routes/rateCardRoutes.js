const express = require("express");

const router = express.Router();

const {
  createRateCard,
  getRateCards,
  updateRateCard,
  deleteRateCard,
} = require("../controllers/rateCardController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  createRateCard
);

router.get("/", authMiddleware, getRateCards);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateRateCard
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteRateCard
);

module.exports = router;