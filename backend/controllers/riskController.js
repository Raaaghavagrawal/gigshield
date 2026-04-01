const { getLatestEventByCity } = require("../models/eventModel");

function scoreToLabel(score) {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

async function getRiskScore(req, res, next) {
  try {
    const city = req.params.city;
    const event = await getLatestEventByCity(city);

    let score;
    let source;

    if (event) {
      const rainfallScore = Math.min(100, (Number(event.rainfall) / 100) * 50);
      const aqiScore = Math.min(100, (Number(event.aqi) / 500) * 50);
      score = Math.min(100, Math.round(rainfallScore + aqiScore));
      source = "event_data";
    } else {
      score = Math.floor(Math.random() * 61) + 20;
      source = "random_fallback";
    }

    return res.json({
      city,
      score,
      label: scoreToLabel(score),
      source,
    });
  } catch (error) {
    return next(error);
  }
}

async function analyzeCityRisk(req, res, next) {
  try {
    const city = (req.body.city || "").trim();
    const weeklyIncome = Number(req.body.weekly_income || 0);

    if (!city || !weeklyIncome) {
      return res
        .status(400)
        .json({ message: "city and weekly_income are required" });
    }

    const event = await getLatestEventByCity(city);
    const rainfall = event ? Number(event.rainfall) : Math.floor(Math.random() * 90);
    const aqi = event ? Number(event.aqi) : 80 + Math.floor(Math.random() * 280);
    const condition = rainfall > 50 ? "Heavy Rain" : aqi > 300 ? "Severe Smog" : "Moderate Conditions";

    const highRisk = rainfall > 50 || aqi > 300;
    const payoutPercentage = highRisk ? 30 : 5;
    const riskScore = Math.min(100, Math.round((rainfall / 100) * 50 + (aqi / 500) * 50));
    const predictedLoss = Number(((weeklyIncome * payoutPercentage) / 100).toFixed(2));
    const fraudFlagged = highRisk && weeklyIncome < 1000;

    const insights = [];
    if (rainfall > 50) {
      insights.push(`🚨 **Heavy Rainfall Detected**: Current precipitation is **${rainfall}mm**. This significantly impacts road visibility and travel safety.`);
    } else if (rainfall > 20) {
      insights.push(`🌧️ **Moderate Rain**: Falling rain (${rainfall}mm) may cause minor delays in delivery logistics.`);
    }

    if (aqi > 300) {
      insights.push(`😷 **Hazardous Air Quality**: AQI is recorded at **${aqi}**. This level is hazardous and may restrict outdoor labor.`);
    } else if (aqi > 150) {
      insights.push(`🌫️ **Poor Visibility**: AQI is **${aqi}**, creating hazy conditions that could slow down transit speeds.`);
    }

    if (highRisk) {
      insights.push(`✅ **Trigger Verified**: Gig-disruption parameters have been met. A payout of **₹${predictedLoss}** is recommended for immediate release.`);
    } else {
      insights.push(`✨ **Operational Stability**: Normal environmental conditions detected. No immediate risk to gig income found.`);
    }

    return res.json({
      city,
      weekly_income: weeklyIncome,
      weather: {
        rainfall,
        aqi,
        condition,
      },
      risk: {
        risk_level: highRisk ? "HIGH" : "LOW",
        risk_score: riskScore,
        payout_percentage: payoutPercentage,
        predicted_loss: predictedLoss,
        suggested_payout: predictedLoss,
        trigger_met: highRisk,
        auto_payout: highRisk,
      },
      insights,
      fraud: {
        fraud_risk: fraudFlagged ? "HIGH" : "LOW",
        fraud_flagged: fraudFlagged,
        fraud_reason: fraudFlagged
          ? "Declared income unusually low during high-risk period."
          : "Normal activity pattern detected.",
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getRiskScore,
  analyzeCityRisk,
};
