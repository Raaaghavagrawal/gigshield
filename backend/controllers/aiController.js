const { computeRiskScore } = require("../services/riskService");
const { detectFraud } = require("../services/fraudService");
const { getFlaggedPayouts } = require("../models/payoutModel");

async function getAiRiskScore(req, res, next) {
  try {
    const city = req.params.city;
    const forecast = req.query.forecast !== "0";
    const result = await computeRiskScore(city, { forecast });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function fraudCheck(req, res, next) {
  try {
    const userId = Number(req.params.user_id);
    const eventId = Number(req.params.event_id);
    if (!userId || !eventId) {
      return res.status(400).json({ message: "user_id and event_id are required" });
    }
    const result = await detectFraud(userId, eventId);
    if (result.flagged) {
      console.log("⚠️ Fraud detected:", userId, result.reason);
    }
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function flaggedPayouts(req, res, next) {
  try {
    const payouts = await getFlaggedPayouts();
    return res.json({ payouts });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAiRiskScore,
  fraudCheck,
  flaggedPayouts,
};

