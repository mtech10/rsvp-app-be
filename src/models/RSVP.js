import mongoose from "mongoose";

const rsvpSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
  },
  status: {
    type: String,
    enum: ["going", "maybe", "not going"],
    default: "going",
  },
});

export default mongoose.model("RSVP", rsvpSchema);
