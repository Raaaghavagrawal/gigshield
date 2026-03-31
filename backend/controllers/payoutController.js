const { createEvent, getEventById } = require("../models/eventModel");
const { getUsersByCityWithActivePolicy } = require("../models/userModel");
const { hasActivePolicy } = require("../models/policyModel");
const {
  hasDuplicatePayout,
  createPayout,
  getPayoutsByUserId,
} = require("../models/payoutModel");

function isTriggered(rainfall, aqi) {
  return Number(rainfall) > 50 || Number(aqi) > 300;
}

async function storeEvent(req, res, next) {
  try {
    const { city, rainfall, aqi, event_date } = req.body;
    if (!city || rainfall === undefined || aqi === undefined || !event_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const triggered = isTriggered(rainfall, aqi);
    const eventId = await createEvent({
      city,
      rainfall: Number(rainfall),
      aqi: Number(aqi),
      eventDate: event_date,
      triggered,
    });

    console.log(
      `[EVENT] event_id=${eventId} city=${city} rainfall=${rainfall} aqi=${aqi} triggered=${triggered}`
    );

    return res.status(201).json({
      message: "Event stored successfully",
      event_id: eventId,
      triggered,
    });
  } catch (error) {
    return next(error);
  }
}

async function runPayout(req, res, next) {
  try {
    const { event_id } = req.body;
    if (!event_id) {
      return res.status(400).json({ message: "event_id is required" });
    }

    const event = await getEventById(Number(event_id));
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!event.triggered) {
      return res.status(200).json({
        message: "Event is not triggered. No payouts generated.",
        processed: 0,
      });
    }

    const users = await getUsersByCityWithActivePolicy(event.city);
    let created = 0;
    let flagged = 0;
    const details = [];

    for (const user of users) {
      let isFlagged = false;
      let flagReason = null;

      const activePolicy = await hasActivePolicy(user.user_id);
      if (!activePolicy) {
        isFlagged = true;
        flagReason = "No active policy";
      }

      const duplicate = await hasDuplicatePayout({
        userId: user.user_id,
        eventId: event.id,
      });
      if (duplicate) {
        isFlagged = true;
        flagReason = flagReason
          ? `${flagReason}; Duplicate payout for same event`
          : "Duplicate payout for same event";
      }

      const payoutAmount =
        (Number(user.weekly_income) * Number(user.coverage_percentage)) / 100;

      const payoutId = await createPayout({
        userId: user.user_id,
        policyId: user.policy_id,
        eventId: event.id,
        amount: payoutAmount.toFixed(2),
        flagged: isFlagged,
        flagReason,
      });

      created += 1;
      if (isFlagged) flagged += 1;

      console.log(
        `[PAYOUT] payout_id=${payoutId} user_id=${user.user_id} event_id=${event.id} amount=${payoutAmount.toFixed(
          2
        )} flagged=${isFlagged}`
      );

      details.push({
        payout_id: payoutId,
        user_id: user.user_id,
        amount: Number(payoutAmount.toFixed(2)),
        flagged: isFlagged,
        flag_reason: flagReason,
      });
    }

    return res.json({
      message: "Payout run completed",
      event_id: event.id,
      city: event.city,
      created,
      flagged,
      payouts: details,
    });
  } catch (error) {
    return next(error);
  }
}

async function getMyWallet(req, res, next) {
  try {
    const userId = req.user.userId;
    const payouts = await getPayoutsByUserId(userId);
    const wallet_balance = payouts.reduce(
      (sum, payout) => sum + Number(payout.amount),
      0
    );

    return res.json({
      wallet_balance: Number(wallet_balance.toFixed(2)),
      payouts,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  storeEvent,
  runPayout,
  getMyWallet,
};
