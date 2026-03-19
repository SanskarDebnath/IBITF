const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.user = payload; // { sub, role }
    next();
  } catch {
    return res.status(401).json({ message: "Invalid/Expired token" });
  }
}

module.exports = { auth };
