import express from "express";
import {
  createEvent,
  getEvents,
  getMyEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import {
  createRSVP,
  cancelRSVP,
  getGuests,
  approveGuest,
  rejectGuest,
  getMyRSVP,
} from "../controllers/rsvpController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", getEvents);

router.get("/my-events", protect, getMyEvents);

router.post("/", protect, createEvent);
router.patch("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);

router.post("/:id/rsvp", protect, createRSVP);
router.delete("/:id/rsvp", protect, cancelRSVP);
router.get("/:id/guests", protect, getGuests);

router.patch("/rsvp/:id/approve", protect, approveGuest);
router.patch("/rsvp/:id/reject", protect, rejectGuest);

router.get("/:id/my-rsvp", protect, getMyRSVP);

// router.get("/:id", getEventById);
router.get("/:id", (req, res) => {
  console.log("ROUTE HIT:", req.params.id);

  return res.json({
    success: true,
    message: "Route is working",
  });
});

export default router;
