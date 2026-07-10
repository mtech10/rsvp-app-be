import Event from "../models/Event.js";

export async function createEvent(req, res) {
  try {
    const event = await Event.create({
      ...req.body,
      host: req.user._id,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
