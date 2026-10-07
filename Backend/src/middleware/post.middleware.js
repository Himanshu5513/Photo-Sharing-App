const jwt = require("jsonwebtoken");

function requirepost(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ msg: "Please log in to Fetch a post" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT);
    req.userId = decoded.userId;
    return next();
  } catch (error) {
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
}

module.exports = requirepost;
