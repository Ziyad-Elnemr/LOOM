const jwt = require("jsonwebtoken");

const ensureSecret = (secretName) => {
  const secret = process.env[secretName];
  if (!secret) {
    throw new Error(`${secretName} is not defined in .env`);
  }
  return secret;
};

const generateAccessToken = (userId, role) =>
  jwt.sign({ id: userId, role }, ensureSecret("JWT_ACCESS_SECRET"), {
    expiresIn: "15m",
  });

const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, ensureSecret("JWT_REFRESH_SECRET"), {
    expiresIn: "7d",
  });

module.exports = { generateAccessToken, generateRefreshToken };
