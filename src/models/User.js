import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },

    followedCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    preferredCities: {
      type: [String],
      default: [],
    },

    preferredLocationType: {
      type: String,
      enum: ["in_person", "online", "both"],
      default: "both",
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
