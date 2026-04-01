const { getLatestEventByCity } = require("../models/eventModel");

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function riskLevelFromScore(score) {
  if (score <= 40) return "Low";
  if (score <= 70) return "Medium";
  return "High";
}

function buildInsight({ level, rainfall, aqi }) {
  const reasons = [];
  if (rainfall > 50) reasons.push("heavy rainfall");
  if (aqi > 300) reasons.push("poor AQI");
  if (!reasons.length) reasons.push("stable conditions");

  if (level === "High") {
    return `High disruption risk due to ${reasons.join(" and ")}.`;
  }
  if (level === "Medium") {
    return `Moderate disruption risk due to ${reasons.join(" and ")}.`;
  }
  return `Low disruption risk with ${reasons.join(" and ")}.`;
}

function simulateForecast(value, jitterPct = 0.08) {
  const base = Number(value) || 0;
  const jitter = base * jitterPct;
  const delta = (Math.random() * 2 - 1) * jitter;
  return base + delta;
}

async function computeRiskScore(city, { forecast = true } = {}) {
  const event = await getLatestEventByCity(city);
  if (!event) {
    const rainfall = Math.floor(Math.random() * 70);
    const aqi = 80 + Math.floor(Math.random() * 220);
    const normalized_rainfall = rainfall / 100;
    const normalized_aqi = aqi / 500;
    const score = clamp(
      Math.round((normalized_rainfall * 0.5 + normalized_aqi * 0.5) * 100),
      0,
      100
    );
    const level = riskLevelFromScore(score);
    return {
      city,
      score,
      level,
      insight: buildInsight({ level, rainfall, aqi }),
      inputs: { rainfall, aqi, source: "random_fallback" },
    };
  }

  const rainfallRaw = Number(event.rainfall) || 0;
  const aqiRaw = Number(event.aqi) || 0;

  const rainfall = forecast ? simulateForecast(rainfallRaw) : rainfallRaw;
  const aqi = forecast ? simulateForecast(aqiRaw) : aqiRaw;

  const normalized_rainfall = clamp(rainfall / 100, 0, 2);
  const normalized_aqi = clamp(aqi / 500, 0, 2);

  const score = clamp(
    Math.round((normalized_rainfall * 0.5 + normalized_aqi * 0.5) * 100),
    0,
    100
  );
  const level = riskLevelFromScore(score);

  return {
    city,
    score,
    level,
    insight: buildInsight({ level, rainfall: rainfallRaw, aqi: aqiRaw }),
    inputs: {
      rainfall: Math.round(rainfallRaw * 100) / 100,
      aqi: Math.round(aqiRaw * 100) / 100,
      source: "latest_event",
      forecast_simulated: forecast,
    },
  };
}

module.exports = {
  computeRiskScore,
};

