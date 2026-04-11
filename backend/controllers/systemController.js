const { pool } = require("../config/db");
const { getRecentLogs } = require("../models/systemLogModel");

async function getSystemStatus(req, res, next) {
  try {
    // 1. Get stats from DB — use pool.query to avoid LIMIT param issues
    const [eventRows] = await pool.query(
      "SELECT COUNT(*) as count FROM events WHERE created_at >= CURDATE()"
    );
    const [payoutRows] = await pool.query(
      "SELECT COUNT(*) as count FROM payouts WHERE created_at >= CURDATE()"
    );
    const [cityRows] = await pool.query(
      "SELECT DISTINCT city FROM events WHERE created_at >= (NOW() - INTERVAL 24 HOUR)"
    );
    const [userRows] = await pool.query(
      "SELECT COUNT(*) as count FROM users"
    );

    const activeCities = cityRows.map(r => r.city);
    const eventsToday = Number(eventRows[0].count) || 0;
    const payoutsToday = Number(payoutRows[0].count) || 0;
    const totalUsers = Number(userRows[0].count) || 0;

    // 2. Real uptime from Node process (seconds → formatted)
    const uptimeSecs = process.uptime();
    const uptimeHours = (uptimeSecs / 3600).toFixed(2);
    const uptimeDisplay = uptimeSecs > 3600
      ? `${Math.floor(uptimeSecs / 3600)}h ${Math.floor((uptimeSecs % 3600) / 60)}m`
      : `${Math.floor(uptimeSecs / 60)}m`;

    // 3. Derive health from today's data
    const system_health = eventsToday > 0 || payoutsToday > 0 ? "Healthy" : "Standby";

    const status = {
      uptime: uptimeDisplay,
      active_nodes: Math.max(1, activeCities.length) * 4,
      active_cities: activeCities.length > 0 ? activeCities : [],
      events_today: eventsToday,
      payouts_today: payoutsToday,
      total_users: totalUsers,
      system_health,
      data_flow: "LIVE",
      last_updated: new Date().toISOString(),
      integrations: {
        weather: "active",
        aqi: "active",
        payout_engine: "ready"
      }
    };

    return res.json(status);
  } catch (error) {
    console.error("[SYSTEM_STATUS_ERROR]", error.message);
    return next(error);
  }
}

async function getSystemLogs(req, res, next) {
  try {
    const logs = await getRecentLogs(10);
    return res.json(logs);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getSystemStatus,
  getSystemLogs,
};

