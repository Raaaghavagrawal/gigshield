const express = require("express");
const {
  fetchAndStoreEnvironment,
  getLatestEvent,
  simulateEvent,
} = require("../controllers/eventController");

const router = express.Router();

router.get("/fetch-environment/:city", fetchAndStoreEnvironment);
router.get("/:city", getLatestEvent);
router.post("/simulate-event", simulateEvent);

module.exports = router;
