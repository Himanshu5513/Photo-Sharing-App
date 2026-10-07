const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ msg: "Please log in to create a post" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT);
    req.userId = decoded.userId;
    return next();
  } catch (error) {
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
}

module.exports = requireAuth;
