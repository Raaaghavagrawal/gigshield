const express = require("express");
const { analyzeCityRisk } = require("../controllers/riskController");

const router = express.Router();

router.post("/", analyzeCityRisk);

module.exports = router;
