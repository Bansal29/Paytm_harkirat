const { JWT_SECRET } = require("./config");
const jwt = require("jsonwebtoken");

const authmiddleware = (req, res, next) => {
  const authheader = req.headers.authorization;
  if (!authheader || !authheader.startsWith("Bearer")) {
    return res.status(403).json({ message: "No token, authorization denied!" });
  }
  //taking only auth token from header
  const token = authheader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.user_id;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Not verified!" });
  }
};
module.exports = {
  authmiddleware,
};
