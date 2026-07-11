import jwt from "jsonwebtoken";
import User from "../models/User.js";

const jwtSecret =
  process.env.JWT_SECRET || process.env.SECRET_KEY || "your_secret_key";

export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Authorization header is missing" });
    }

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid authorization format" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User Not Found" });
    }

    req.user = user;

    next();
  } catch (error) {
    res
      .status(401)
      .json({ success: false, message: "Not Authorized, token failed" });
  }
}

export default protect;
