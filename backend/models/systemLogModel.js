const { pool } = require("../config/db");

async function syncSystemLogTableSchema() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS system_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_type VARCHAR(50) NOT NULL,
      message TEXT NOT NULL,
      level ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);
}

async function addSystemLog(eventType, message, level = 'info') {
  await pool.execute(
    "INSERT INTO system_logs (event_type, message, level) VALUES (?, ?, ?)",
    [eventType, message, level]
  );
}

async function getRecentLogs(limit = 10) {
  const limitValue = Math.min(Number(limit) || 10, 50);
  const [rows] = await pool.query(
    `SELECT l.id, l.event_type, l.message, l.level, l.created_at
     FROM system_logs l
     INNER JOIN (
       SELECT message, MAX(created_at) AS max_created
       FROM system_logs
       GROUP BY message
     ) u ON l.message = u.message AND l.created_at = u.max_created
     ORDER BY l.created_at DESC
     LIMIT ${limitValue}`
  );
  return rows;
}

module.exports = {
  syncSystemLogTableSchema,
  addSystemLog,
  getRecentLogs,
};
