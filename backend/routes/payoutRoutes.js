const express = require("express");
const {
  runPayoutManual,
  simulatePayout,
  getWallet,
  getUserPayouts,
} = require("../controllers/payoutController");

const router = express.Router();

router.post("/run", runPayoutManual);
router.post("/simulate", simulatePayout);

// Handling both /wallet/:user_id and /payouts/:user_id
router.get("/:user_id", (req, res, next) => {
  if (req.baseUrl.includes('wallet')) {
    return getWallet(req, res, next);
  }
  if (req.baseUrl.includes('payouts')) {
    return getUserPayouts(req, res, next);
  }
  return res.status(404).json({ message: "Route not found" });
});

module.exports = router;
