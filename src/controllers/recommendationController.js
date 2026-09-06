import Event from "../models/Event.js";
import RSVP from "../models/RSVP.js";
import User from "../models/User.js";

export async function getRecommendedEvents(req, res) {
  try {
    const user = await User.findById(req.user._id).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const followedCategories = user.followedCategories || [];

    const previousRSVPs = await RSVP.find({
      user: req.user._id,
    })
      .populate("event", "categories city locationType")
      .lean();

    const categoryScores = {};
    const cityScores = {};
    const locationTypeScores = {};

    previousRSVPs.forEach((rsvp) => {
      const event = rsvp.event;

      if (!event) return;

      (event.categories || []).forEach((categoryId) => {
        const key = String(categoryId);

        categoryScores[key] = (categoryScores[key] || 0) + 3;
      });

      if (event.city) {
        const city = event.city.toLowerCase();

        cityScores[city] = (cityScores[city] || 0) + 2;
      }

      if (event.locationType) {
        locationTypeScores[event.locationType] =
          (locationTypeScores[event.locationType] || 0) + 1;
      }
    });

    followedCategories.forEach((categoryId) => {
      const key = String(categoryId);

      categoryScores[key] = (categoryScores[key] || 0) + 5;
    });

    const events = await Event.find({
      visibility: "public",
      startAt: {
        $gte: new Date(),
      },
    })
      .populate("host", "name email")
      .populate("categories", "name description isActive")
      .limit(100)
      .lean();

    const scoredEvents = events.map((event) => {
      let score = 0;

      (event.categories || []).forEach((category) => {
        score += categoryScores[String(category._id)] || 0;
      });

      if (event.city) {
        score += cityScores[event.city.toLowerCase()] || 0;
      }

      if (event.locationType) {
        score += locationTypeScores[event.locationType] || 0;
      }

      score += Math.min(event.popularityScore || 0, 20);

      if (event.featured) {
        score += 5;
      }

      return {
        ...event,
        recommendationScore: score,
      };
    });

    scoredEvents.sort((a, b) => b.recommendationScore - a.recommendationScore);

    return res.status(200).json({
      success: true,
      events: scoredEvents.slice(0, 20),
    });
  } catch (error) {
    console.error("RECOMMENDATIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}
