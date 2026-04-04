const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testDbConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.query("SELECT 1");
    console.log(`[DB] Connected to Railway MySQL 🚀 (${process.env.DB_HOST}:${process.env.DB_PORT || 3306})`);
  } catch (err) {
    console.error("DB connection failed:", err.message);
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  testDbConnection,
};
