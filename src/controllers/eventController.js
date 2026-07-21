import Event from "../models/Event.js";
import mongoose from "mongoose";
import RSVP from "../models/RSVP.js";

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
    const events = await Event.find({ host: req.user._id }).sort({
      createdAt: -1,
    });

    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const totalGuests = await RSVP.countDocuments({
          event: event._id,
        });

        const approvedGuests = await RSVP.countDocuments({
          event: event._id,
          status: "going",
        });

        const pendingGuests = await RSVP.countDocuments({
          event: event._id,
          status: "pending",
        });

        const rejectedGuests = await RSVP.countDocuments({
          event: event._id,
          status: "rejected",
        });

        return {
          ...event.toObject(),
          totalGuests,
          approvedGuests,
          pendingGuests,
          rejectedGuests,
        };
      }),
    );

    return res.json({
      success: true,
      events: eventsWithStats,
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
    const event = await Event.findById(req.params.id).populate(
      "host",
      "name email",
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const goingCount = await RSVP.countDocuments({
      event: event._id,
      status: "going",
    });

    return res.json({
      success: true,
      event: {
        ...event.toObject(),
        goingCount,
      },
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

    const updatedEvents = [];

    for (const event of events) {
      const goingCount = await RSVP.countDocuments({
        event: event._id,
        status: "going",
      });

      updatedEvents.push({
        ...event.toObject(),
        goingCount,
      });
    }

    return res.status(200).json({
      success: true,
      events: updatedEvents,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateEvent(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

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
        message: "You are not allowed to edit this event.",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "coverUrl",
      "theme",
      "startAt",
      "endAt",
      "timezone",
      "locationType",
      "venue",
      "address",
      "city",
      "visibility",
      "ticketType",
      "price",
      "currency",
      "capacity",
      "requireApproval",
      "category",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    await event.save();

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
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

export async function deleteEvent(req, res) {
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
        message: "You are not allowed to delete this event.",
      });
    }

    await event.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getEventAnalytics(req, res) {
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

    const [totalGuests, going, pending, rejected, cancelled, ticketsSold] =
      await Promise.all([
        RSVP.countDocuments({ event: id }),
        RSVP.countDocuments({ event: id, status: "going" }),
        RSVP.countDocuments({ event: id, status: "pending" }),
        RSVP.countDocuments({ event: id, status: "rejected" }),
        RSVP.countDocuments({ event: id, status: "cancelled" }),

        RSVP.aggregate([
          {
            $match: {
              event: event._id,
              status: { $ne: "cancelled" },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$tickets" },
            },
          },
        ]),
      ]);
    const capacity = event.capacity || 0;

    const occupancy =
      capacity > 0 ? Math.round((going / capacity) * 100) : null;

    const recentRSVPs = await RSVP.find({
      event: id,
    })
      .populate("user", "name email")
      .sort({ updatedAt: -1 })
      .limit(8)
      .select("status tickets updatedAt user");

    const dailyRSVPs = await RSVP.aggregate([
      {
        $match: {
          event: event._id,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    return res.json({
      success: true,
      analytics: {
        totalGuests,
        going,
        pending,
        rejected,
        cancelled,
        ticketsSold: ticketsSold[0]?.total || 0,
        capacity,
        occupancy,
        recentRSVPs,
        dailyRSVPs,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
