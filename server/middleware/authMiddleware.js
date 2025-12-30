const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

  const token = authHeader.split(" ")[1]; // Bearer tokenString
  if (!token) return res.status(401).json({ error: "No token found, please login." });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded user from token:", user);  // Add this line for debugging
    req.user = user; // Attach user info to req.user
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    res.status(403).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;
