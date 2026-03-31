const express = require("express");
const { getRiskScore } = require("../controllers/riskController");

const router = express.Router();

router.get("/:city", getRiskScore);

module.exports = router;
