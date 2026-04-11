const mysql = require("mysql2/promise");

const databaseUrl = (process.env.DATABASE_URL || "").trim();
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Add your MySQL URL to backend/.env and save the file (an empty .env file will not work)."
  );
}

// The pool can take the DATABASE_URL connection string directly as its configuration.
// We then append the required SSL settings for Railway compatibility.
const pool = mysql.createPool({
  uri: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testDbConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.query("SELECT 1");
    console.log(`[DB] Connected to Railway MySQL 🚀 (Public URL)`);
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
