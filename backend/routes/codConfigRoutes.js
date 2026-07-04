const express = require("express");
const router = express.Router();

const {
  setCodConfig,
  getCodConfigs,
  deleteCodConfig,
} = require("../controllers/codConfigController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, roleMiddleware("admin"), setCodConfig);
router.get("/", authMiddleware, getCodConfigs);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteCodConfig);

module.exports = router;
