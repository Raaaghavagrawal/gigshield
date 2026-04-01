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

async function syncUserTableSchema() {
  await ensureColumn("users", "last_active_at", "TIMESTAMP NULL DEFAULT NULL");
}

async function createUser({
  name,
  email,
  passwordHash,
  city,
  platform,
  weeklyIncome,
}) {
  const [result] = await pool.execute(
    `INSERT INTO users (name, email, password, city, platform, weekly_income, last_active_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [name, email, passwordHash, city, platform, weeklyIncome]
  );
  return result.insertId;
}

async function getUserByEmail(email) {
  const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  return rows[0] || null;
}

async function getUserById(id) {
  const [rows] = await pool.execute(
    "SELECT id, name, email, city, platform, weekly_income FROM users WHERE id = ?",
    [id]
  );
  return rows[0] || null;
}

async function getUserInternal(id) {
  await syncUserTableSchema();
  const [rows] = await pool.execute(
    "SELECT id, name, email, city, platform, weekly_income, last_active_at FROM users WHERE id = ?",
    [id]
  );
  return rows[0] || null;
}

async function touchUserActivity(userId) {
  await syncUserTableSchema();
  await pool.execute("UPDATE users SET last_active_at = NOW() WHERE id = ?", [
    userId,
  ]);
}

async function getUsersByCityWithActivePolicy(city) {
  const [rows] = await pool.execute(
    `SELECT 
       u.id AS user_id,
       u.name,
       u.city,
       u.weekly_income,
       p.id AS policy_id,
       p.coverage_percentage
     FROM users u
     INNER JOIN policies p ON p.user_id = u.id
     WHERE u.city = ?
       AND p.status = 'active'`,
    [city]
  );
  return rows;
}

module.exports = {
  syncUserTableSchema,
  createUser,
  getUserByEmail,
  getUserById,
  getUserInternal,
  touchUserActivity,
  getUsersByCityWithActivePolicy,
};
