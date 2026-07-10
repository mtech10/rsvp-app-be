// models/Category.js
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true, // e.g., "Tech Meetup", "Party", "Workshop"
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true, // Admin can set this to false to hide it from the frontend dropdown
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Category", categorySchema);
