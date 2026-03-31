const mysql = require("mysql2/promise");
const { URL } = require("url");

function getDbConfig() {
  if (process.env.DATABASE_URL) {
    const parsed = new URL(process.env.DATABASE_URL);
    return {
      host: parsed.hostname,
      port: Number(parsed.port || 3306),
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace("/", ""),
    };
  }

  const requiredVars = ["DB_HOST", "DB_USER", "DB_NAME"];
  const missing = requiredVars.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(
      `Missing DB env vars: ${missing.join(", ")}. Set DATABASE_URL or DB_HOST/DB_USER/DB_PASSWORD/DB_NAME in .env`
    );
  }

  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
  };
}

const dbConfig = getDbConfig();

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testDbConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.query("SELECT 1");
    console.log(`[DB] Connected successfully to ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  testDbConnection,
};
