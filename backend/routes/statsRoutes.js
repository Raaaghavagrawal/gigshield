const express = require("express");
const { getStats } = require("../controllers/statsController");
const { protect } = require("./userRoutes");

const router = express.Router();

// Dashboard data is now user-specific and requires a valid token
router.get("/", protect, getStats);
router.get("/dashboard", protect, getStats);

module.exports = router;
