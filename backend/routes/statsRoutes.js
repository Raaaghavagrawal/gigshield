const express = require("express");
const { getStats } = require("../controllers/statsController");

const router = express.Router();

// Allow access at root or /dashboard subgroup
router.get("/", getStats);
router.get("/dashboard", getStats);

module.exports = router;
