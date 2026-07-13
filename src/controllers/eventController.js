import Event from "../models/Event.js";
import mongoose from "mongoose";

export async function createEvent(req, res) {
  try {
    const {
      title,
      description,
      coverUrl,
      theme,
      startAt,
      endAt,
      timezone,
      locationType,
      venue,
      address,
      city,
      visibility,
      ticketType,
      price,
      currency,
      capacity,
      requireApproval,
      category,
    } = req.body;

    if (!title || !startAt) {
      return res.status(400).json({
        success: false,
        message: "Title and start date are required",
      });
    }

    const event = await Event.create({
      title,
      description,
      coverUrl,
      theme,
      startAt,
      endAt,
      timezone,
      locationType,
      venue,
      address,
      city,
      visibility,
      ticketType,
      price,
      currency,
      capacity,
      requireApproval,
      category,

      // The logged-in user becomes the host
      host: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}

export async function getMyEvents(req, res) {
  try {
    const events = await Event.find({
      host: req.user._id,
    })
      .sort({ createdAt: -1 })
      .populate("host", "name email");

    return res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getEventById(req, res) {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    // Find event
    const event = await Event.findById(id).populate("host", "name email");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Authorization
    if (event.host._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getEvents(req, res) {
  try {
    const events = await Event.find({
      visibility: "public",
    })
      .populate("host", "name email")
      .sort({ startAt: 1 });

    return res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
