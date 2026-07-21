import Event from "../models/Event.js";
import RSVP from "../models/RSVP.js";
import {
  notifyOrganizerOfRSVP,
  notifyOrganizerOfCancellation,
  notifyGuestApproved,
  notifyGuestRejected,
} from "../utils/notificationService.js";

export async function createRSVP(req, res) {
  try {
    const { id } = req.params;
    const { tickets = 1 } = req.body;

    console.log("req.params.id:", req.params.id);
    console.log("req.body:", req.body);

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.host.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot RSVP to your own event",
      });
    }

    const existingRSVP = await RSVP.findOne({
      event: id,
      user: req.user._id,
    });

    if (existingRSVP) {
      if (existingRSVP.status === "cancelled") {
        existingRSVP.status = event.requireApproval ? "pending" : "going";
        existingRSVP.tickets = tickets;

        await existingRSVP.save();

        await notifyOrganizerOfRSVP(event, req.user);

        return res.status(200).json({
          success: true,
          message: "RSVP submitted successfully.",
          rsvp: existingRSVP,
        });
      }

      return res.status(400).json({
        success: false,
        message: "You have already RSVP'd to this event",
      });
    }

    const totalRSVPs = await RSVP.countDocuments({
      event: event._id,
      status: { $in: ["going", "pending"] },
    });

    if (event.capacity && totalRSVPs >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: "This event is full",
      });
    }
    const status = event.requireApproval ? "pending" : "going";

    const rsvp = await RSVP.create({
      event: event._id,
      user: req.user._id,
      tickets,
      status,
    });

    await notifyOrganizerOfRSVP(event, req.user);

    return res.status(201).json({
      success: true,
      message: "RSVP successful",
      rsvp,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function cancelRSVP(req, res) {
  try {
    const { id } = req.params;

    const rsvp = await RSVP.findOne({
      event: id,
      user: req.user._id,
    }).populate("event");

    if (!rsvp) {
      return res.status(404).json({
        success: false,
        message: "RSVP not found",
      });
    }

    rsvp.status = "cancelled";

    await rsvp.save();

    await notifyOrganizerOfCancellation(rsvp.event, req.user);

    return res.json({
      success: true,
      message: "RSVP cancelled successfully.",
      rsvp,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getGuests(req, res) {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const guests = await RSVP.find({ event: id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      guests,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function updateGuestStatus(req, res, status) {
  try {
    const { id } = req.params;

    const rsvp = await RSVP.findById(id).populate("event");

    if (!rsvp) {
      return res.status(404).json({
        success: false,
        message: "RSVP not found",
      });
    }

    if (rsvp.event.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    rsvp.status = status;

    await rsvp.save();

    if (status === "going") {
      await notifyGuestApproved(rsvp.event, {
        _id: rsvp.user,
      });
    } else if (status === "rejected") {
      await notifyGuestRejected(rsvp.event, {
        _id: rsvp.user,
      });
    }

    return res.json({
      success: true,
      message: status === "going" ? "Guest approved" : "Guest rejected",
      rsvp,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function approveGuest(req, res) {
  return updateGuestStatus(req, res, "going");
}

export async function rejectGuest(req, res) {
  return updateGuestStatus(req, res, "rejected");
}

export async function getMyRSVP(req, res) {
  try {
    const { id } = req.params;

    const rsvp = await RSVP.findOne({
      event: id,
      user: req.user._id,
    });

    return res.json({
      success: true,
      rsvp,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
