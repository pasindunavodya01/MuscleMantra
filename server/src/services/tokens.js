const jwt = require("jsonwebtoken");

function signAccessToken({ userId, role }, jwtSecret) {
  return jwt.sign({ sub: userId, role }, jwtSecret, { expiresIn: "7d" });
}

module.exports = { signAccessToken };

