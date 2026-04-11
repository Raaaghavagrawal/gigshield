const { getDashboardStats } = require("../models/statsModel");
const { getLatestEventByCity } = require("../models/eventModel");
const { getIntegratedAIPredictions } = require("../services/aiService");
const { getWalletByUserId } = require("../models/walletModel");

async function getStats(req, res, next) {
  try {
    const userId = req.user.id;
    const city = req.user.city || "Mumbai";

    // 1. Fetch Basic DB Stats (Global and User-Specific)
    const [globalStats, wallet] = await Promise.all([
      getDashboardStats(),
      getWalletByUserId(userId)
    ]);

    // 2. Fetch Latest Weather for the User's City
    const eventData = await getLatestEventByCity(city);

    // 3. Call AI Service via the backend service layer
    // This removes the need for the frontend to talk to AI service directly.
    const aiResponse = await getIntegratedAIPredictions({
      city: city,
      platform: req.user.platform,
      avg_daily_deliveries: req.user.avg_daily_deliveries || 20,
      earnings_per_delivery: req.user.earnings_per_delivery || 40,
      rainfall: eventData?.rainfall || 0,
      aqi: eventData?.aqi || 50,
      temperature: eventData?.temperature || 25,
    });

    // 4. Combine into a "Unified Dashboard Response"
    const response = {
      user: {
        id: userId,
        name: req.user.name,
        city: city,
        wallet_balance: wallet.balance,
      },
      ai_metrics: aiResponse,
      environment: {
        rainfall: eventData?.rainfall || 0,
        aqi: eventData?.aqi || 50,
        temperature: eventData?.temperature || 25,
        city: city,
      },
      system_stats: globalStats
    };

    return res.json(response);
  } catch (error) {
    console.error("[Stats Controller Error]", error.message);
    return next(error);
  }
}

module.exports = {
  getStats
};
