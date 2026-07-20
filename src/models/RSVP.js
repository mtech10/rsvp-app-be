import mongoose from "mongoose";

const rsvpSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["going", "pending", "rejected", "cancelled"],
      default: "going",
    },

    tickets: {
      type: Number,
      default: 1,
      min: 1,
    },

    checkedIn: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

rsvpSchema.index(
  {
    event: 1,
    user: 1,
  },
  {
    unique: true,
  },
);

export default mongoose.model("RSVP", rsvpSchema);
