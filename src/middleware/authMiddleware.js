import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getAuthToken } from "../utils/authCookie.js";

export async function protect(req, res, next) {
  try {
    const token = getAuthToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication cookie is missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User Not Found",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
}

export default protect;
