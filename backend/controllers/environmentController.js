const { ingestEnvironmentForCity } = require("../controllers/eventController");

async function getUnifiedEnvironmentData(req, res, next) {
  try {
    const city = (req.params.city || "").trim();
    if (!city) return res.status(400).json({ message: "city is required" });

    // 1. Fetch real-time data AND store it in DB (using existing flow)
    const liveData = await ingestEnvironmentForCity(city);

    // 2. AI POWERED PREDICTIONS (NEW)
    const hour = new Date().getHours();
    const isPeak = (hour >= 11 && hour <= 14) || (hour >= 18 && hour <= 21);
    
    const userFeatures = {
      city: liveData.city,
      rainfall: liveData.rainfall,
      aqi: liveData.aqi,
      temperature: liveData.temperature,
      platform: req.user?.platform || "Swiggy",
      avg_daily_deliveries: req.user?.avg_daily_deliveries || 20,
      earnings_per_delivery: req.user?.earnings_per_delivery || 40,
      is_peak_hour: isPeak,
      is_swiggy: (req.user?.platform || "Swiggy").toLowerCase() === "swiggy"
    };

    const aiPrediction = await require("../services/aiService").getIntegratedAIPredictions(userFeatures);

    return res.json({
      city: liveData.city,
      rainfall: liveData.rainfall,
      temperature: liveData.temperature,
      aqi: liveData.aqi,
      condition: liveData.weather_condition,
      pollution_level: liveData.pollution_level,
      risk_level: aiPrediction.risk_level,
      risk_score: aiPrediction.risk_score,
      confidence: aiPrediction.confidence,
      disruption_probability: aiPrediction.risk_score / 100,
      expected_loss_pct: aiPrediction.loss_percentage,
      estimated_loss_val: aiPrediction.estimated_loss,
      ai_insight: aiPrediction.explanation,
      timestamp: liveData.event_date
    });
  } catch (error) {
    console.error("[ENVIRONMENT_UNIFIED_ERROR]", error.message);
    return next(error);
  }
}

async function getHistoricalEnvironmentData(req, res, next) {
  try {
    const city = (req.params.city || "").trim();
    if (!city) return res.status(400).json({ message: "city is required" });

    const { getRecentEventsByCity } = require("../models/eventModel");
    const events = await getRecentEventsByCity(city, 10);

    if (!events.length) {
      return res.json([]);
    }

    const toIso = (v) => {
      if (v == null) return null;
      const d = v instanceof Date ? v : new Date(v);
      return Number.isNaN(d.getTime()) ? String(v) : d.toISOString();
    };

    const history = events.map((ev) => {
      const rf = Number(ev.rainfall);
      const aq = Number(ev.aqi);
      const risk_score = Math.min(
        100,
        Math.max(
          0,
          Math.round((rf / 100) * 0.5 * 100 + (aq / 500) * 0.5 * 100)
        )
      );
      const loss = Math.min(
        100,
        Math.round((rf / 200 + aq / 500) * 50)
      );
      const createdAtIso = toIso(ev.created_at);
      const eventDateIso = toIso(ev.event_date);
      const ts =
        createdAtIso ||
        (eventDateIso ? `${String(eventDateIso).slice(0, 10)}T00:00:00.000Z` : null);

      return {
        rainfall: rf,
        aqi: aq,
        temperature: Number(ev.temperature),
        event_date: eventDateIso,
        created_at: createdAtIso,
        timestamp: ts,
        pollution_level: ev.pollution_level,
        city: ev.city,
        risk_score,
        loss,
      };
    });

    return res.json(history);
  } catch (error) {
    console.error("[ENVIRONMENT_HISTORY_ERROR]", error.message);
    return next(error);
  }
}

module.exports = {
  getUnifiedEnvironmentData,
  getHistoricalEnvironmentData,
};
