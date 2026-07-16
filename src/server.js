import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import authRoutes from "./Routes/authRoutes.js";
import eventRoutes from "./Routes/eventRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import connectDB from "./config/db.js";
import dns from "node:dns/promises";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.json({ status: "Api is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
