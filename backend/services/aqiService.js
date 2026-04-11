const axios = require("axios");

// In-memory cache: city -> { aqi, pollutionLevel, cachedAt }
const aqiCache = {};
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function mapPollutionLevel(aqi) {
  const value = Number(aqi || 0);
  if (value <= 50) return "Good";
  if (value <= 100) return "Moderate";
  if (value <= 150) return "Unhealthy for Sensitive Groups";
  if (value <= 200) return "Unhealthy";
  if (value <= 300) return "Very Unhealthy";
  return "Hazardous";
}

/**
 * Exponential-backoff retry wrapper.
 * @param {Function} fn         Async function to retry
 * @param {number}   retries    Total attempts
 * @param {number}   baseMs     Base delay in ms
 */
async function withRetry(fn, retries = 3, baseMs = 500) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        const delay = baseMs * Math.pow(2, attempt - 1);
        console.warn(
          `[AQI] Attempt ${attempt}/${retries} failed: ${err.message}. Retrying in ${delay}ms...`
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

function isCacheFresh(city) {
  const entry = aqiCache[city];
  return entry && Date.now() - entry.cachedAt < CACHE_TTL_MS;
}

async function fetchFallbackFromDb(city) {
  try {
    const { getLatestEventByCity } = require("../models/eventModel");
    const event = await getLatestEventByCity(city);
    if (event) {
      console.warn(`[AQI] Using DB fallback for ${city}`);
      return {
        aqi: Number(event.aqi) || 50,
        pollutionLevel: event.pollution_level || "Moderate",
        source: "db_fallback",
      };
    }
  } catch (dbErr) {
    console.error("[AQI] DB fallback failed:", dbErr.message);
  }
  return null; // DB failed or no record
}

async function fetchAqiByCity(city) {
  if (isCacheFresh(city)) {
    console.log(`[AQI] Serving from cache for ${city}`);
    return { ...aqiCache[city].data, source: "cache" };
  }

  const apiKey = process.env.AQICN_API_KEY;
  if (!apiKey) {
    throw new Error("AQICN_API_KEY is missing");
  }

  const url = `https://api.waqi.info/feed/${encodeURIComponent(city)}/`;

  try {
    const response = await withRetry(
      () =>
        axios.get(url, {
          params: { token: apiKey },
          timeout: 10000,
        }),
      3,
      500
    );

    const payload = response.data || {};
    if (payload.status !== "ok") {
      throw new Error(`AQICN API returned status: ${payload.status || "unknown"}`);
    }

    const aqi = Number(payload?.data?.aqi || 0);
    const pollutionLevel = mapPollutionLevel(aqi);

    const result = { aqi, pollutionLevel, source: "api" };

    // Update Cache
    aqiCache[city] = { data: result, cachedAt: Date.now() };

    const { addSystemLog } = require("../models/systemLogModel");
    await addSystemLog(
      "aqi_fetch",
      `AQI OK for ${city}: ${aqi} (${pollutionLevel})`,
      "success"
    );

    return result;
  } catch (err) {
    console.error(`[AQI] All retries failed for ${city}: ${err.message}`);

    if (aqiCache[city]) {
      console.warn(`[AQI] Using stale cache for ${city}`);
      return { ...aqiCache[city].data, source: "stale_cache" };
    }

    const dbFallback = await fetchFallbackFromDb(city);
    if (dbFallback) return dbFallback;

    console.error(`[AQI] No fallback available for ${city}. Using safe defaults.`);
    const { addSystemLog } = require("../models/systemLogModel");
    await addSystemLog(
      "aqi_fetch",
      `AQI fetch FAILED for ${city}. Safe defaults used.`,
      "error"
    );
    return { aqi: 50, pollutionLevel: "Good", source: "default" };
  }
}

module.exports = {
  fetchAqiByCity,
};
