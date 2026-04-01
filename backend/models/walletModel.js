const { pool } = require("../config/db");

async function syncWalletTableSchema() {
  // Can be used to ensure columns if needed
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
  createWallet,
  getWalletByUserId,
  updateWalletBalance,
};
