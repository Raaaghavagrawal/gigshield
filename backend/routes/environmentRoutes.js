const express = require("express");
const { getUnifiedEnvironmentData, getHistoricalEnvironmentData } = require("../controllers/environmentController");
const { protect } = require("./userRoutes");

const router = express.Router();

router.get("/:city/history", protect, getHistoricalEnvironmentData);
router.get("/:city", protect, getUnifiedEnvironmentData);

module.exports = router;
