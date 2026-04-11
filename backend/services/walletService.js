const { getWalletByUserId, updateWalletBalance, createWallet } = require("../models/walletModel");

async function getUserWallet(userId) {
  return await getWalletByUserId(userId);
}

async function addBalance(userId, amount) {
  await updateWalletBalance(userId, amount);
}

async function initializeWallet(userId) {
  await createWallet(userId);
}

module.exports = {
  getUserWallet,
  addBalance,
  initializeWallet,
};
