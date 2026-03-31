const { pool } = require("../config/db");

async function hasDuplicatePayout({ userId, eventId }) {
  const [rows] = await pool.execute(
    `SELECT id FROM payouts
     WHERE user_id = ? AND event_id = ?
     LIMIT 1`,
    [userId, eventId]
  );
  return Boolean(rows.length);
}

async function createPayout({
  userId,
  policyId,
  eventId,
  amount,
  flagged = false,
  flagReason = null,
}) {
  const [result] = await pool.execute(
    `INSERT INTO payouts (user_id, policy_id, event_id, amount, flagged, flag_reason)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, policyId, eventId, amount, flagged, flagReason]
  );
  return result.insertId;
}

async function getPayoutsByUserId(userId) {
  const [rows] = await pool.execute(
    `SELECT 
       p.id,
       p.amount,
       p.flagged,
       p.flag_reason,
       p.created_at,
       e.city,
       e.event_date
     FROM payouts p
     INNER JOIN events e ON e.id = p.event_id
     WHERE p.user_id = ?
     ORDER BY p.id DESC`,
    [userId]
  );
  return rows;
}

module.exports = {
  hasDuplicatePayout,
  createPayout,
  getPayoutsByUserId,
};
