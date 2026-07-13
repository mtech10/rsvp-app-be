import express from "express";
import {
  createEvent,
  getEvents,
  getMyEvents,
  getEventById,
} from "../controllers/eventController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", getEvents);
router.get("/:id", getEventById);

router.use(protect);

router.post("/", createEvent);
router.get("/my-events", getMyEvents);

export default router;
