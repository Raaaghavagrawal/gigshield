const { pool } = require("../config/db");

async function createUser({
  name,
  email,
  passwordHash,
  city,
  platform,
  weeklyIncome,
}) {
  const [result] = await pool.execute(
    `INSERT INTO users (name, email, password, city, platform, weekly_income)
     VALUES (?, ?, ?, ?, ?, ?)`,
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
  createUser,
  getUserByEmail,
  getUserById,
  getUsersByCityWithActivePolicy,
};
