import express from "express";

import { getRecommendedEvents } from "../controllers/recommendationController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getRecommendedEvents);

export default router;
