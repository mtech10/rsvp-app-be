import express from "express";
import {
  createEvent,
  getMyEvents,
  getEventById,
} from "../controllers/eventController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.use(protect);

router.post("/", createEvent);

router.get("/my", getMyEvents);

router.get("/:id", getEventById);

export default router;
