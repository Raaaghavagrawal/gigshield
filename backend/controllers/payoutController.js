const { processPayoutsForCity, simulateEventAndPayout } = require("../services/payoutService");
const { getUserWallet } = require("../services/walletService");
const { getPayoutsByUserId } = require("../models/payoutModel");

async function runPayoutManual(req, res, next) {
  try {
    const { city } = req.body;
    if (!city) {
      return res.status(400).json({ message: "city is required" });
    }
    const result = await processPayoutsForCity(city);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function simulatePayout(req, res, next) {
  try {
    const { city, rainfall, aqi } = req.body;
    if (!city || rainfall === undefined || aqi === undefined) {
      return res.status(400).json({ message: "city, rainfall, and aqi are required" });
    }
    const result = await simulateEventAndPayout(city, Number(rainfall), Number(aqi));
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function getWallet(req, res, next) {
  try {
    const userId = Number(req.params.user_id);
    if (!userId) {
      return res.status(400).json({ message: "user_id is required" });
    }
    const wallet = await getUserWallet(userId);
    return res.json({ balance: Number(wallet.balance) });
  } catch (error) {
    return next(error);
  }
}

async function getUserPayouts(req, res, next) {
  try {
    const userId = Number(req.params.user_id);
    if (!userId) {
      return res.status(400).json({ message: "user_id is required" });
    }
    const payouts = await getPayoutsByUserId(userId);
    return res.json(payouts);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  runPayoutManual,
  simulatePayout,
  getWallet,
  getUserPayouts,
};
