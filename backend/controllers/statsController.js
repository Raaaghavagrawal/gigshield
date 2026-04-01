const { getDashboardStats } = require("../models/statsModel");

async function getStats(req, res, next) {
  try {
    const stats = await getDashboardStats();
    return res.json(stats);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getStats
};
