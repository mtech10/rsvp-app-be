import express from "express";
import { createEvent } from "../controllers/eventController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/", createEvent);

export default router;
