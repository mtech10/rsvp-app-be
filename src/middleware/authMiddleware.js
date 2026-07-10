import jwt from "jsonwebtoken";
import User from "../models/User.js";

const jwtSecret =
  process.env.JWT_SECRET || process.env.SECRET_KEY || "your_secret_key";

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not Authorized, No Token" });
    }

    const decoded = jwt.verify(header.split(" ")[1], jwtSecret);
    req.user = await User.findById(decoded.userId || decoded.id);

    if (!req.user) {
      return res.status(401).json({ message: "User Not Found" });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: "Not Authorized, token failed" });
  }
}

export default protect;
