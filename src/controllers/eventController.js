import Event from "../models/Event.js";

// Create a new event
export async function createEvent(req, res) {
  try {
    const { title, description, date, location } = req.body;
    const newEvent = await Event.create({
      title,
      description,
      date,
      location,
      host: req.user.userId, // Assuming you have auth middleware to attach user
    });
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get all events
export async function getAllEvents(req, res) {
  try {
    const events = await Event.find().populate("host", "name");
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get single event
export async function getEventById(req, res) {
  try {
    const event = await Event.findById(req.params.id).populate("host", "name");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
