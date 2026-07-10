import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    apiId: { type: String, required: true, unique: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: String,
    coverUrl: String,
    theme: String,
    startAt: { type: Date, required: true },
    endAt: Date,
    timezone: String,
    locationType: { type: String, enum: ["in_person", "online"] },
    venue: String,
    address: String,
    city: String,
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    ticketType: {
      type: String,
      enum: ["free", "paid", "approval", "registration"],
    },
    price: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    capacity: Number,
    requireApproval: { type: Boolean, default: false },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  },
  { timestamps: true },
);

export default mongoose.model("Event", eventSchema);
