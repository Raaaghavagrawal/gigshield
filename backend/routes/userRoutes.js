const express = require("express");
const { getUserById } = require("../models/userModel");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Middleware to protect routes and add user to req
async function protect(req, res, next) {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
}

router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

module.exports = { router, protect };
