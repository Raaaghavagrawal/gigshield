const { hasActivePolicy } = require("../models/policyModel");
const { getUserInternal, syncUserTableSchema, touchUserActivity } = require("../models/userModel");
const { getEventById } = require("../models/eventModel");
const {
  hasDuplicatePayout,
  countUserPayoutsLast7Days,
} = require("../models/payoutModel");

async function detectFraud(userId, eventId) {
  await syncUserTableSchema();

  const user = await getUserInternal(userId);
  if (!user) {
    return { flagged: true, reason: "User not found" };
  }

  const event = await getEventById(eventId);
  if (!event) {
    return { flagged: true, reason: "Event not found" };
  }

  // A. No Active Policy
  const active = await hasActivePolicy(userId);
  if (!active) {
    return { flagged: true, reason: "No active policy" };
  }

  // B. Duplicate Claim
  const duplicate = await hasDuplicatePayout({ userId, eventId });
  if (duplicate) {
    return { flagged: true, reason: "Duplicate claim detected" };
  }

  // C. Abnormal Pattern
  const payoutCount7d = await countUserPayoutsLast7Days(userId);
  if (payoutCount7d > 3) {
    return { flagged: true, reason: "Abnormal pattern: >3 payouts in last 7 days" };
  }

  // D. Location Mismatch
  if ((user.city || "").toLowerCase() !== (event.city || "").toLowerCase()) {
    return { flagged: true, reason: "Location mismatch: user city differs from event city" };
  }

  // E. Inactive User (IMPORTANT)
  // Lightweight proxy: if user has not been active in last 7 days (or never active), flag.
  const lastActive = user.last_active_at ? new Date(user.last_active_at) : null;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const inactive =
    !lastActive || Date.now() - lastActive.getTime() > sevenDaysMs;
  if (inactive) {
    return { flagged: true, reason: "Inactive user: no recent activity before payout" };
  }

  // If everything looks good, record activity (so future checks have a baseline)
  await touchUserActivity(userId);

  return { flagged: false, reason: null };
}

module.exports = {
  detectFraud,
};

