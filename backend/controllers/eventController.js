const { createEvent, getLatestEventByCity } = require("../models/eventModel");
const { fetchWeatherByCity } = require("../services/weatherService");
const { fetchAqiByCity } = require("../services/aqiService");

function computeTriggered(rainfall, aqi) {
  const isDemo = process.env.DEMO_MODE === "true";
  if (isDemo) return true;
  return Number(rainfall) > 5 || Number(aqi) > 150;
}

async function ingestEnvironmentForCity(city) {
  const [weather, aqiData] = await Promise.all([
    fetchWeatherByCity(city),
    fetchAqiByCity(city),
  ]);

  const triggered = computeTriggered(weather.rainfall, aqiData.aqi);
  const eventDate = new Date().toISOString().slice(0, 10);

  const eventId = await createEvent({
    city,
    rainfall: weather.rainfall,
    temperature: weather.temperature,
    aqi: aqiData.aqi,
    pollutionLevel: aqiData.pollutionLevel,
    eventDate,
    triggered,
  });

  console.log(
    `[EVENT] event_id=${eventId} city=${city} rainfall=${weather.rainfall} temp=${weather.temperature} aqi=${aqiData.aqi} triggered=${triggered}`
  );

  return {
    event_id: eventId,
    city,
    rainfall: weather.rainfall,
    temperature: weather.temperature,
    weather_condition: weather.weatherCondition,
    aqi: aqiData.aqi,
    pollution_level: aqiData.pollutionLevel,
    event_date: eventDate,
    triggered,
  };
}

async function fetchAndStoreEnvironment(req, res, next) {
  try {
    const city = (req.params.city || "").trim();
    if (!city) return res.status(400).json({ message: "city is required" });

    const result = await ingestEnvironmentForCity(city);
    return res.status(201).json({
      message: "Environment data fetched and stored",
      data: result,
    });
  } catch (error) {
    console.error("[ENV_FETCH_ERROR]", error.message);
    return next(error);
  }
}

async function getLatestEvent(req, res, next) {
  try {
    const city = (req.params.city || "").trim();
    if (!city) return res.status(400).json({ message: "city is required" });

    const latest = await getLatestEventByCity(city);
    if (!latest) {
      return res.status(404).json({ message: "No events found for this city" });
    }

    return res.json({ data: latest });
  } catch (error) {
    return next(error);
  }
}

async function simulateEvent(req, res, next) {
  try {
    const { city, rainfall, aqi, temperature } = req.body;
    if (!city || rainfall === undefined || aqi === undefined) {
      return res
        .status(400)
        .json({ message: "city, rainfall and aqi are required" });
    }

    const eventDate = new Date().toISOString().slice(0, 10);
    const forcedTriggered = true;
    const eventId = await createEvent({
      city,
      rainfall: Number(rainfall),
      temperature: Number(temperature || 0),
      aqi: Number(aqi),
      pollutionLevel: Number(aqi) > 300 ? "Hazardous" : "Moderate",
      eventDate,
      triggered: forcedTriggered,
    });

    console.log(
      `[SIMULATE_EVENT] event_id=${eventId} city=${city} rainfall=${rainfall} aqi=${aqi} forced_trigger=true`
    );

    // Call payout service
    const { processPayoutsForCity } = require("../services/payoutService");
    const payoutResult = await processPayoutsForCity(city);
    console.log("💰 Payout Triggered for City:", city, payoutResult);

    return res.status(201).json({
      message: "Simulated event created and payouts triggered",
      data: {
        event_id: eventId,
        city,
        payouts: payoutResult
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  ingestEnvironmentForCity,
  fetchAndStoreEnvironment,
  getLatestEvent,
  simulateEvent,
};
