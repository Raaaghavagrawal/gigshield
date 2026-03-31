const express = require("express");
const auth = require("../middleware/auth");
const { runPayout, getMyWallet } = require("../controllers/payoutController");

const router = express.Router();

router.post("/run-payout", auth, runPayout);
router.get("/wallet", auth, getMyWallet);

module.exports = router;
