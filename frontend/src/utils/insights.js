function formatINR(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "₹0";
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function safeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Whether a system log line refers to `city` (matches backend copy: "… for CITY …", "… in CITY").
 */
export function systemLogMatchesCity(message, cityRaw) {
  const city = String(cityRaw ?? "").trim();
  if (!city) return true;

  const esc = escapeRegExp(city);
  const reFor = new RegExp(`\\bfor\\s+${esc}\\b`, "i");
  const reIn = new RegExp(`\\bin\\s+${esc}\\b`, "i");
  return reFor.test(String(message ?? "")) || reIn.test(String(message ?? ""));
}

/** Numeric score + band from displayed weather inputs (must match AQI + rainfall on screen). */
export function computeRiskFromWeather({ aqi, rainfall }) {
  const a = Number(aqi);
  const r = Number(rainfall);
  if (!Number.isFinite(a)) return { level: "Low", score: 0 };
  const ra = Number.isFinite(r) ? r : 0;
  let score = 0;
  if (a > 100) score += 50;
  else if (a > 50) score += 25;
  if (ra > 10) score += 30;
  const level = score < 30 ? "Low" : score < 70 ? "Medium" : "High";
  return { level, score: Math.min(100, score) };
}

export function calculateRisk({ aqi, rainfall }) {
  return computeRiskFromWeather({ aqi, rainfall }).level;
}

export function generateInsight(aqi, risk) {
  const n = Number(aqi);
  const r = String(risk || "");
  if (r === "Low") {
    return `Risk is low due to good AQI levels (${n}).`;
  }
  if (r === "Medium") {
    return `Moderate risk due to AQI level (${n}).`;
  }
  return `High risk due to poor AQI levels (${n}).`;
}

/** US EPA-style labels for the numeric AQI shown in the UI. */
export function getAqiLabel(aqi) {
  const a = Number(aqi);
  if (!Number.isFinite(a)) return "Unknown";
  if (a <= 50) return "Good";
  if (a <= 100) return "Moderate";
  if (a <= 150) return "Unhealthy (Sensitive)";
  return "Unhealthy";
}

/**
 * Single source of truth for risk, insight, and payout fields from the same AQI/rainfall as the snapshot.
 */
export function buildSyncedAnalysisFromEnvSnapshot(envSnapshot, { income, city }) {
  if (!envSnapshot) return null;
  const rainfall = Number(envSnapshot.rainfall);
  const aqi = Number(envSnapshot.aqi);
  if (!Number.isFinite(aqi) || !Number.isFinite(rainfall)) return null;
  const { level, score } = computeRiskFromWeather({ aqi, rainfall });
  const insight = generateInsight(aqi, level);
  const high = level === "High";
  const payoutPct = high ? 0.3 : 0.05;
  const payout = Number(income) * payoutPct;
  const lossPct = level === "High" ? 30 : level === "Medium" ? 15 : 5;
  return {
    city: city || envSnapshot.city,
    weekly_income: Number(income),
    weather: {
      rainfall,
      aqi,
      condition: envSnapshot.condition || "Unknown",
    },
    risk: {
      risk_level: level,
      risk_score: score,
      suggested_payout: payout,
      auto_payout: high,
    },
    disruption_probability: score / 100,
    expected_loss_pct: lossPct,
    estimated_loss_val: payout,
    ai_insight: insight,
  };
}

/** Loss % estimate aligned with backend history helper (same shape as env history loss). */
export function computeLossDisplay(aqi, rainfall) {
  const rf = Number(rainfall) || 0;
  const aq = Number(aqi) || 0;
  return Math.min(100, Math.round((rf / 200 + aq / 500) * 50));
}

function clampNonNegative(n, max) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.min(max, Math.max(0, x));
}

/**
 * Smooth oscillation + bounded pseudo-noise around env-derived baselines (not plotting raw scores).
 * Uses bucket time + wall clock + optional tick so the series drifts slowly when refreshed.
 */
function applyRiskLossVariance({
  baseRisk,
  baseLoss,
  slotIndex,
  slotCount,
  bucketKeyMs,
  nowMs,
  varianceTick = 0,
}) {
  const denom = Math.max(1, slotCount - 1);
  const t = slotIndex / denom;
  const periodMs = 20 * 60 * 1000;
  const wallPhase = ((nowMs % periodMs) / periodMs) * Math.PI * 2;
  const tickPhase = varianceTick * 0.22;
  const smooth = Math.sin(t * Math.PI * 2 + wallPhase + tickPhase);

  const n1 = Math.sin(bucketKeyMs * 2.17e-6 + slotIndex * 1.91 + varianceTick * 0.73);
  const n2 = Math.cos(bucketKeyMs * 1.53e-6 + slotIndex * 2.71 + varianceTick * 0.41);
  const noise = 0.55 * n1 + 0.35 * n2;

  const riskAmp = Math.max(5, Math.min(14, baseRisk * 0.22 + 6));
  const lossAmp = Math.max(1.5, Math.min(5, baseLoss * 0.28 + 2.2));

  const risk = clampNonNegative(
    baseRisk + riskAmp * smooth + riskAmp * 0.28 * noise,
    100
  );
  const loss = clampNonNegative(
    baseLoss + lossAmp * smooth + lossAmp * 0.32 * noise,
    100
  );

  return {
    risk: Math.round(risk * 10) / 10,
    loss: Math.round(loss * 10) / 10,
  };
}

/** Display-only rainfall / AQI with sine + pseudo-noise (de-correlated from risk series). */
function applyEnvBarVariance({
  baseRain,
  baseAqi,
  slotIndex,
  slotCount,
  bucketKeyMs,
  nowMs,
  varianceTick = 0,
}) {
  const denom = Math.max(1, slotCount - 1);
  const t = slotIndex / denom;
  const periodMs = 20 * 60 * 1000;
  const wallPhase = ((nowMs % periodMs) / periodMs) * Math.PI * 2;
  const tickPhase = varianceTick * 0.31;
  const smoothR = Math.cos(t * Math.PI * 2 * 1.3 + wallPhase * 0.7 + tickPhase);
  const smoothA = Math.sin(t * Math.PI * 2 * 0.85 + wallPhase + tickPhase * 1.1);

  const n1 = Math.sin(bucketKeyMs * 3.1e-6 + slotIndex * 2.41 + varianceTick * 0.67);
  const n2 = Math.cos(bucketKeyMs * 2.4e-6 + slotIndex * 1.17 + varianceTick * 0.89);
  const noise = 0.5 * n1 + 0.45 * n2;

  const br = Number(baseRain) || 0;
  const ba = Number(baseAqi) || 0;
  const rainAmp = Math.max(0.8, Math.min(6, br * 0.35 + 2.5));
  const aqiAmp = Math.max(6, Math.min(28, ba * 0.12 + 14));

  let rainfall = br + rainAmp * smoothR + rainAmp * 0.4 * noise;
  let aqi = ba + aqiAmp * smoothA + aqiAmp * 0.35 * noise;

  rainfall = clampNonNegative(rainfall, 120);
  aqi = clampNonNegative(aqi, 500);

  return {
    rainfall: Math.round(rainfall * 10) / 10,
    aqi: Math.round(aqi * 10) / 10,
  };
}

/**
 * Fixed wall‑clock grid on the X-axis: `slotCount` consecutive slots of `slotMinutes` each,
 * ending at the current boundary. Missing buckets forward‑fill from the last known sample
 * (or live snapshot).
 *
 * @param {object} [options]
 * @param {number} [options.varianceTick] Increment on each refresh window (e.g. every 20 min).
 * @param {number} [options.slotMinutes] Bucket width in minutes (default 20).
 */
export function buildTenMinuteSlotSeries(envData, envSnapshot, slotCount = 8, options = {}) {
  const { varianceTick = 0, slotMinutes = 20 } = options;
  const ms = slotMinutes * 60 * 1000;
  const now = Date.now();
  const endBucket = Math.floor(now / ms) * ms;
  const startBucket = endBucket - (slotCount - 1) * ms;

  const bucketMap = new Map();
  for (const p of envData || []) {
    const t = new Date(p.timestamp).getTime();
    if (Number.isNaN(t)) continue;
    const key = Math.floor(t / ms) * ms;
    if (key < startBucket || key > endBucket) continue;
    const cur = bucketMap.get(key);
    if (!cur || t >= cur.ts) {
      bucketMap.set(key, { ts: t, p: { ...p } });
    }
  }

  if (envSnapshot) {
    const key = Math.floor(now / ms) * ms;
    bucketMap.set(key, {
      ts: now,
      p: {
        timestamp: new Date(now).toISOString(),
        rainfall: Number(envSnapshot.rainfall),
        aqi: Number(envSnapshot.aqi),
        temperature: envSnapshot.temperature,
        pollution_level: envSnapshot.pollution_level,
        city: envSnapshot.city,
      },
    });
  }

  let carryRain = 0;
  let carryAqi = 0;
  let haveCarry = false;

  const rows = [];
  let slotIndex = 0;
  for (let k = startBucket; k <= endBucket; k += ms) {
    const hit = bucketMap.get(k);
    if (hit) {
      carryRain = Number(hit.p.rainfall) || 0;
      carryAqi = Number(hit.p.aqi) || 0;
      haveCarry = true;
    } else if (!haveCarry && envSnapshot) {
      carryRain = Number(envSnapshot.rainfall) || 0;
      carryAqi = Number(envSnapshot.aqi) || 0;
      haveCarry = true;
    } else if (!haveCarry) {
      carryRain = 0;
      carryAqi = 0;
    }

    const { score: baseRisk } = computeRiskFromWeather({ aqi: carryAqi, rainfall: carryRain });
    const baseLoss = computeLossDisplay(carryAqi, carryRain);
    const { risk, loss } = applyRiskLossVariance({
      baseRisk,
      baseLoss,
      slotIndex,
      slotCount,
      bucketKeyMs: k,
      nowMs: now,
      varianceTick,
    });
    const { rainfall: dispRain, aqi: dispAqi } = applyEnvBarVariance({
      baseRain: carryRain,
      baseAqi: carryAqi,
      slotIndex,
      slotCount,
      bucketKeyMs: k,
      nowMs: now,
      varianceTick,
    });
    const label = new Date(k).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    rows.push({
      bucketKey: k,
      t: label,
      risk,
      loss,
      rainfall: dispRain,
      aqi: dispAqi,
    });
    slotIndex += 1;
  }

  return rows;
}

export function buildExplainableInsights(analysis) {
  if (!analysis) return [];

  const city = analysis.city || "your city";
  const rainfall = safeNumber(analysis?.weather?.rainfall ?? analysis.rainfall);
  const aqi = safeNumber(analysis?.weather?.aqi ?? analysis.aqi);
  const condition = (analysis?.weather?.condition ?? analysis.condition) || "current conditions";

  const riskLevel = (analysis?.risk?.risk_level ?? analysis.risk_level) || "—";
  const riskScore = safeNumber(analysis?.risk?.risk_score ?? analysis.risk_score);
  const payoutPct = safeNumber(
    analysis?.risk?.payout_percentage ??
      (riskLevel === "High" ? 30 : riskLevel === "Medium" ? 15 : 5)
  );
  const payout = safeNumber(analysis?.risk?.suggested_payout);
  const weeklyIncome = safeNumber(analysis?.weekly_income);
  const trigger = Boolean(analysis?.risk?.trigger_met ?? (rainfall > 50 || aqi > 300));

  const fraudFlagged = Boolean(analysis?.fraud?.fraud_flagged);
  const fraudReason = analysis?.fraud?.fraud_reason;

  const lines = [];

  lines.push(
    `In ${city}, conditions look like ${condition} (rainfall ${rainfall}mm, AQI ${aqi}).`
  );

  if (trigger) {
    const reasons = [];
    if (rainfall > 50) reasons.push("rainfall crossed 50mm");
    if (aqi > 300) reasons.push("AQI crossed 300");
    lines.push(
      `This crosses the payout trigger because ${reasons.join(" and ")}.`
    );
  } else {
    lines.push(
      `No payout trigger right now because rainfall is ≤ 50mm and AQI is ≤ 300.`
    );
  }

  lines.push(
    `Your risk level is ${riskLevel} with a score of ${riskScore}/100.`
  );

  if (weeklyIncome > 0) {
    lines.push(
      `With weekly income ${formatINR(weeklyIncome)} and coverage ${payoutPct}%, the expected payout is about ${formatINR(
        payout
      )}.`
    );
  } else {
    lines.push(
      `Expected payout is based on your coverage (${payoutPct}%) and weekly income.`
    );
  }

  if (fraudFlagged) {
    lines.push(
      `This payout may be flagged for review: ${fraudReason || "suspicious pattern detected"}.`
    );
  } else {
    lines.push(`No fraud flags detected for this run.`);
  }

  return lines;
}

/** Short narrative for how risk / loss evolved across the chart window (uses display series). */
export function describeRiskWindowTrend(chartData) {
  if (!Array.isArray(chartData) || chartData.length < 2) return null;
  const risks = chartData.map((d) => Number(d.risk)).filter(Number.isFinite);
  const losses = chartData.map((d) => Number(d.loss)).filter(Number.isFinite);
  if (risks.length < 2) return null;

  const firstR = risks[0];
  const lastR = risks[risks.length - 1];
  const minR = Math.min(...risks);
  const maxR = Math.max(...risks);
  const delta = lastR - firstR;
  const range = maxR - minR;

  let riskPart;
  if (range < 1.5 && Math.abs(delta) < 1) {
    riskPart = `Across the visible window, the risk score stayed near ${lastR.toFixed(1)} with little drift.`;
  } else if (delta > 2) {
    riskPart = `Risk climbs from about ${firstR.toFixed(1)} toward ${lastR.toFixed(1)} in the latest buckets—environmental stress is building in the model.`;
  } else if (delta < -2) {
    riskPart = `Risk softens from about ${firstR.toFixed(1)} down to ${lastR.toFixed(1)} over the window.`;
  } else {
    riskPart = `Risk oscillates between roughly ${minR.toFixed(1)} and ${maxR.toFixed(1)} rather than moving in one direction—typical short-horizon variability.`;
  }

  let lossPart = "";
  if (losses.length >= 2) {
    const fl = losses[0];
    const ll = losses[losses.length - 1];
    const dL = ll - fl;
    if (Math.abs(dL) >= 0.8) {
      lossPart = ` Estimated loss % moves from ${fl.toFixed(1)}% to ${ll.toFixed(1)}% over the same span.`;
    }
  }

  return riskPart + lossPart;
}

/** Longer policy copy tying disruption, loss, payout, and weather together. */
export function buildExtendedPolicyRecommendation(analysis) {
  if (!analysis) return "";
  const level = analysis?.risk?.risk_level || "Low";
  const p = Math.round((Number(analysis.disruption_probability) || 0) * 100);
  const el = safeNumber(analysis.expected_loss_pct);
  const varVal = safeNumber(analysis.estimated_loss_val);
  const score = safeNumber(analysis?.risk?.risk_score);
  const rain = safeNumber(analysis?.weather?.rainfall);
  const aqi = safeNumber(analysis?.weather?.aqi);
  const cond = (analysis?.weather?.condition || "current conditions").toLowerCase();

  const payoutLine = `Modeled disruption sits near ${p}%, with expected loss around ${el}% of notional exposure and an indicative net credit of ${formatINR(
    varVal
  )} against your weekly income.`;

  if (level === "High") {
    return `${payoutLine} Rainfall is ${rain}mm and AQI is ${aqi} (${cond}). Threat score is ${score}/100—prioritize safety, shorten outdoor blocks, and avoid peak pollution or storm windows until readings improve.`;
  }
  if (level === "Medium") {
    return `${payoutLine} Conditions (${rain}mm rain, AQI ${aqi}, ${cond}) justify staying alert: batch trips, keep backup indoor tasks ready, and re-run the risk scan if rain or AQI jump sharply.`;
  }
  return `${payoutLine} With ${rain}mm rain, AQI ${aqi}, and ${cond} skies, the model labels threat as ${level} (score ${score}/100). Operations look viable for active delivery nodes; still log any sudden weather swings so payouts stay aligned with lived conditions.`;
}

