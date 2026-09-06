import Event from "../models/Event.js";
import mongoose from "mongoose";
import RSVP from "../models/RSVP.js";
import { classifyEvent } from "../services/categoryClassifier.js";

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
      latitude,
      longitude,
      visibility,
      ticketType,
      price,
      currency,
      capacity,
      requireApproval,
    } = req.body;

    let location;

    if (
      locationType === "in_person" &&
      latitude !== undefined &&
      longitude !== undefined
    ) {
      const lat = Number(latitude);
      const lng = Number(longitude);

      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      ) {
        location = {
          type: "Point",
          coordinates: [lng, lat],
        };
      }
    }

    const categories = await classifyEvent({
      title,
      description,
      theme,
      venue,
      city,
    });

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
      location,
      visibility,
      ticketType,
      price,
      currency,
      capacity,
      requireApproval,
      categories,
      host: req.user._id,
    });

    const populatedEvent = await Event.findById(event._id).populate(
      "categories",
      "name description isActive",
    );

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: populatedEvent,
    });
  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getMyEvents(req, res) {
  try {
    const events = await Event.find({
      host: req.user._id,
    })
      .populate("categories", "name description isActive")
      .sort({
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
    console.error("GET MY EVENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getEventById(req, res) {
  try {
    const event = await Event.findById(req.params.id)
      .populate("host", "name email")
      .populate("categories", "name description isActive");

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
    console.error("GET EVENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getEvents(req, res) {
  try {
    const {
      date = "all",
      city = "all",
      location = "all",
      category,
      search,
    } = req.query;

    const now = new Date();

    const filter = {
      visibility: "public",
    };

    // ----------------------------------------------------------
    // CATEGORY
    // ----------------------------------------------------------

    if (category) {
      filter.categories = category;
    }

    // ----------------------------------------------------------
    // SEARCH
    // ----------------------------------------------------------

    if (search?.trim()) {
      const regex = new RegExp(search.trim(), "i");

      filter.$or = [
        { title: regex },
        { description: regex },
        { theme: regex },
        { venue: regex },
        { address: regex },
        { city: regex },
      ];
    }

    if (date === "today") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      filter.startAt = {
        $gte: now,
        $lt: end,
      };
    }

    if (date === "week") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);

      const day = start.getDay();
      const diff = day === 0 ? 6 : day - 1;

      start.setDate(start.getDate() - diff);

      const end = new Date(start);
      end.setDate(end.getDate() + 7);

      filter.startAt = {
        $gte: now > start ? now : start,
        $lt: end,
      };
    }

    if (date === "weekend") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);

      const day = start.getDay();

      // If today is Saturday or Sunday, use the current weekend.
      // Otherwise, use the next weekend.
      if (day !== 0 && day !== 6) {
        const daysUntilSaturday = 6 - day;
        start.setDate(start.getDate() + daysUntilSaturday);
      } else if (day === 0) {
        start.setDate(start.getDate() - 1);
      }

      const end = new Date(start);
      end.setDate(end.getDate() + 2);

      filter.startAt = {
        $gte: now > start ? now : start,
        $lt: end,
      };
    }

    if (date === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      filter.startAt = {
        $gte: now > start ? now : start,
        $lt: end,
      };
    }

    if (date === "upcoming") {
      filter.startAt = {
        $gte: new Date(),
      };
    }

    if (city !== "all") {
      filter.city = new RegExp(`^${city}$`, "i");
    }

    if (location === "online") {
      filter.locationType = "online";
    }

    if (location === "in_person") {
      filter.locationType = "in_person";
    }

    const sortOption = {
      startAt: 1,
    };

    // ----------------------------------------------------------
    // FETCH EVENTS
    // ----------------------------------------------------------

    const events = await Event.find(filter)
      .populate("host", "name email")
      .populate("categories", "name description isActive")
      .sort(sortOption);

    const updatedEvents = await Promise.all(
      events.map(async (event) => {
        const goingCount = await RSVP.countDocuments({
          event: event._id,
          status: "going",
        });

        return {
          ...event.toObject(),
          goingCount,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      events: updatedEvents,
    });
  } catch (error) {
    console.error("GET EVENTS ERROR:", error);

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
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    // ----------------------------------------------------------
    // UPDATE GEOLOCATION
    // ----------------------------------------------------------

    if (
      event.locationType === "in_person" &&
      req.body.latitude !== undefined &&
      req.body.longitude !== undefined
    ) {
      const lat = Number(req.body.latitude);
      const lng = Number(req.body.longitude);

      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      ) {
        event.location = {
          type: "Point",
          coordinates: [lng, lat],
        };
      }
    }

    if (event.locationType === "online") {
      event.location = undefined;
    }

    // ----------------------------------------------------------
    // RECALCULATE DISCOVERY CATEGORIES
    // ----------------------------------------------------------

    event.categories = await classifyEvent(event);

    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate("host", "name email")
      .populate("categories", "name description isActive");

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);

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
    console.error("DELETE EVENT ERROR:", error);

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
        RSVP.countDocuments({
          event: id,
        }),

        RSVP.countDocuments({
          event: id,
          status: "going",
        }),

        RSVP.countDocuments({
          event: id,
          status: "pending",
        }),

        RSVP.countDocuments({
          event: id,
          status: "rejected",
        }),

        RSVP.countDocuments({
          event: id,
          status: "cancelled",
        }),

        RSVP.aggregate([
          {
            $match: {
              event: event._id,
              status: {
                $ne: "cancelled",
              },
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: "$tickets",
              },
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
      .sort({
        updatedAt: -1,
      })
      .limit(8)
      .select("status tickets updatedAt user");

    const dailyRSVPs = await RSVP.aggregate([
      {
        $match: {
          event: event._id,
          status: {
            $ne: "cancelled",
          },
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
          count: {
            $sum: 1,
          },
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
    console.error("GET EVENT ANALYTICS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getNearbyEvents(req, res) {
  try {
    const { latitude, longitude, radius = 25000, category, search } = req.query;

    const lat = Number(latitude);
    const lng = Number(longitude);
    const maxDistance = Number(radius);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required.",
      });
    }

    if (lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude.",
      });
    }

    if (lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: "Invalid longitude.",
      });
    }

    const filter = {
      visibility: "public",
      startAt: {
        $gte: new Date(),
      },
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: maxDistance,
        },
      },
    };

    if (category) {
      filter.categories = category;
    }

    if (search?.trim()) {
      const regex = new RegExp(search.trim(), "i");

      filter.$or = [
        { title: regex },
        { description: regex },
        { theme: regex },
        { venue: regex },
        { address: regex },
        { city: regex },
      ];
    }

    const events = await Event.find(filter)
      .populate("host", "name email")
      .populate("categories", "name description isActive")
      .limit(100);

    const updatedEvents = await Promise.all(
      events.map(async (event) => {
        const goingCount = await RSVP.countDocuments({
          event: event._id,
          status: "going",
        });

        return {
          ...event.toObject(),
          goingCount,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      events: updatedEvents,
    });
  } catch (error) {
    console.error("GET NEARBY EVENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getFeaturedEvents(req, res) {
  try {
    const events = await Event.find({
      visibility: "public",
      featured: true,
      startAt: {
        $gte: new Date(),
      },
    })
      .populate("host", "name email")
      .populate("categories", "name description isActive")
      .sort({
        popularityScore: -1,
        startAt: 1,
      })
      .limit(20);

    return res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("GET FEATURED EVENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
