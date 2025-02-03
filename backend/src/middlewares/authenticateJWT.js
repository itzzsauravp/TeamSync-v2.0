import jwt from "jsonwebtoken";
import "dotenv/config";
const authenticateJWT = (req, res, next) => {
  const token = req.header("Authorization").split(" ")[1];
  if (!token) {
    return res
      .status(403)
      .json({ success: false, message: "Access denied. No token provided" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

export default authenticateJWT;
