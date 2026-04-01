const { pool } = require("../config/db");

async function syncWalletTableSchema() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS wallets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      balance DECIMAL(15, 2) DEFAULT 0.00,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);
}

async function createWallet(userId) {
  await pool.execute(
    "INSERT IGNORE INTO wallets (user_id, balance) VALUES (?, 0)",
    [userId]
  );
}

async function getWalletByUserId(userId) {
  const [rows] = await pool.execute(
    "SELECT balance, updated_at FROM wallets WHERE user_id = ?",
    [userId]
  );
  if (!rows.length) {
    await createWallet(userId);
    return { balance: 0 };
  }
  return rows[0];
}

async function updateWalletBalance(userId, amount) {
  // Using a transaction usually better, but here simple SQL
  await pool.execute(
    "UPDATE wallets SET balance = balance + ? WHERE user_id = ?",
    [amount, userId]
  );
}

module.exports = {
  syncWalletTableSchema,
  createWallet,
  getWalletByUserId,
  updateWalletBalance,
};
