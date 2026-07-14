import express from "express";
import {
  createEvent,
  getEvents,
  getMyEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", getEvents);

router.get("/my-events", protect, getMyEvents);

router.post("/", protect, createEvent);
router.patch("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);

router.get("/:id", getEventById);

export default router;
