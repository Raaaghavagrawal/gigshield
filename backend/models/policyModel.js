const { pool } = require("../config/db");

async function createPolicy({
  userId,
  premium,
  coveragePercentage,
  startDate,
  status = "active",
}) {
  const [result] = await pool.execute(
    `INSERT INTO policies (user_id, premium, coverage_percentage, start_date, status)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, premium, coveragePercentage, startDate, status]
  );
  return result.insertId;
}

async function getPoliciesByUserId(userId) {
  const [rows] = await pool.execute(
    "SELECT * FROM policies WHERE user_id = ? ORDER BY id DESC",
    [userId]
  );
  return rows;
}

async function hasActivePolicy(userId) {
  const [rows] = await pool.execute(
    `SELECT id FROM policies
     WHERE user_id = ? AND status = 'active'
     LIMIT 1`,
    [userId]
  );
  return Boolean(rows.length);
}

module.exports = {
  createPolicy,
  getPoliciesByUserId,
  hasActivePolicy,
};
