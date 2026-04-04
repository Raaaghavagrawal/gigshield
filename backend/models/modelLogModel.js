const { pool } = require("../config/db");

async function ensureModelLogsTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS model_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        city VARCHAR(120),
        model_type VARCHAR(50),
        inputs JSON,
        prediction JSON,
        actual_outcome VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (err) {
    if (err.code !== "ER_DUP_FIELDNAME") {
      console.error("[MODEL_LOG_TABLE_ERROR]", err.message);
    }
  }
}

async function logModelPrediction(city, modelType, inputs, prediction) {
  try {
    await ensureModelLogsTable();
    const [result] = await pool.execute(
      `INSERT INTO model_logs (city, model_type, inputs, prediction) VALUES (?, ?, ?, ?)`,
      [city, modelType, JSON.stringify(inputs), JSON.stringify(prediction)]
    );
    return result.insertId;
  } catch (err) {
    console.error("[MODEL_LOG_INSERT_ERROR]", err.message);
  }
}

async function updateModelActualOutcome(logId, outcome) {
  try {
    await pool.execute(
      `UPDATE model_logs SET actual_outcome = ? WHERE id = ?`,
      [outcome, logId]
    );
  } catch (err) {
    console.error("[MODEL_LOG_UPDATE_ERROR]", err.message);
  }
}

module.exports = {
  logModelPrediction,
  updateModelActualOutcome,
};
