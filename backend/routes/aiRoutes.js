const express = require("express");
const {
  getAiRiskScore,
  fraudCheck,
  flaggedPayouts,
} = require("../controllers/aiController");

const router = express.Router();

router.get("/risk-score/:city", getAiRiskScore);
router.get("/fraud-check/:user_id/:event_id", fraudCheck);
router.get("/flagged-payouts", flaggedPayouts);

module.exports = router;

