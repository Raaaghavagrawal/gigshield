const { pool } = require("../config/db");

async function columnExists(tableName, columnName) {
  const [rows] = await pool.execute(
    `SELECT 1 AS ok
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = ?
       AND column_name = ?
     LIMIT 1`,
    [tableName, columnName]
  );
  return Boolean(rows.length);
}

async function ensureColumn(tableName, columnName, columnDefinitionSql) {
  const exists = await columnExists(tableName, columnName);
  if (exists) return;
  try {
    await pool.execute(
      `ALTER TABLE \`${tableName}\`
       ADD COLUMN \`${columnName}\` ${columnDefinitionSql}`
    );
  } catch (error) {
    if (error && error.code === "ER_DUP_FIELDNAME") return;
    throw error;
  }
}

async function syncPayoutTableSchema() {
  // Backwards-compatible: keep existing flag_reason, add reason + status
  await ensureColumn("payouts", "reason", "VARCHAR(255) NULL");
  await ensureColumn(
    "payouts",
    "status",
    "ENUM('credited','under_review') NOT NULL DEFAULT 'credited'"
  );
}

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
  reason = null,
  status = "credited",
}) {
  await syncPayoutTableSchema();
  const resolvedReason = reason || flagReason;
  const [result] = await pool.execute(
    `INSERT INTO payouts (user_id, policy_id, event_id, amount, flagged, flag_reason, reason, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, policyId, eventId, amount, flagged, flagReason, resolvedReason, status]
  );
  return result.insertId;
}

async function countUserPayoutsLast7Days(userId) {
  await syncPayoutTableSchema();
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS c
     FROM payouts
     WHERE user_id = ?
       AND created_at >= (NOW() - INTERVAL 7 DAY)`,
    [userId]
  );
  return Number(rows?.[0]?.c || 0);
}

async function getFlaggedPayouts() {
  await syncPayoutTableSchema();
  const [rows] = await pool.execute(
    `SELECT 
       p.id,
       p.user_id,
       p.event_id,
       p.amount,
       p.flagged,
       p.reason,
       p.status,
       p.created_at,
       e.city,
       e.event_date
     FROM payouts p
     INNER JOIN events e ON e.id = p.event_id
     WHERE p.flagged = TRUE OR p.status = 'under_review'
     ORDER BY p.id DESC
     LIMIT 200`
  );
  return rows;
}

async function getPayoutsByUserId(userId) {
  await syncPayoutTableSchema();
  const [rows] = await pool.execute(
    `SELECT 
       p.id,
       p.amount,
       p.flagged,
       p.flag_reason,
       p.reason,
       p.status,
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
  syncPayoutTableSchema,
  hasDuplicatePayout,
  createPayout,
  countUserPayoutsLast7Days,
  getFlaggedPayouts,
  getPayoutsByUserId,
};
