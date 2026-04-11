const { createPolicy, getPoliciesByUserId } = require("../models/policyModel");

async function createPolicyForUser(req, res, next) {
  try {
    const userId = req.user.userId;
    const { premium, coverage_percentage, start_date, status } = req.body;

    if (!premium || !coverage_percentage || !start_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const policyId = await createPolicy({
      userId,
      premium: Number(premium),
      coveragePercentage: Number(coverage_percentage),
      startDate: start_date,
      status: status || "active",
    });

    return res.status(201).json({
      message: "Policy created successfully",
      policy_id: policyId,
    });
  } catch (error) {
    return next(error);
  }
}

async function getMyPolicies(req, res, next) {
  try {
    const userId = req.user.userId;
    const policies = await getPoliciesByUserId(userId);
    return res.json({ policies });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createPolicyForUser,
  getMyPolicies,
};
