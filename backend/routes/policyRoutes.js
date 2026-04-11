const express = require("express");
const auth = require("../middleware/auth");
const {
  createPolicyForUser,
  getMyPolicies,
} = require("../controllers/policyController");

const router = express.Router();

router.post("/", auth, createPolicyForUser);
router.get("/me", auth, getMyPolicies);

module.exports = router;
