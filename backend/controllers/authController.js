const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  createUser,
  getUserByEmail,
  getUserById,
} = require("../models/userModel");

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

async function signup(req, res, next) {
  try {
    const { name, email, password, city, platform, weekly_income } = req.body;

    if (!name || !email || !password || !city || !platform || !weekly_income) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await createUser({
      name,
      email,
      passwordHash,
      city,
      platform,
      weeklyIncome: Number(weekly_income),
    });

    const token = signToken({ userId });
    const user = await getUserById(userId);

    return res.status(201).json({
      message: "User created successfully",
      token,
      user,
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({ userId: user.id });
    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        city: user.city,
        platform: user.platform,
        weekly_income: user.weekly_income,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  signup,
  login,
};
