// import mongoose from "mongoose";

// const eventSchema = new mongoose.Schema(
//   {
//     host: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     title: {
//       type: String,
//       required: true,
//     },

//     description: String,
//     coverUrl: String,
//     theme: String,

//     startAt: {
//       type: Date,
//       required: true,
//     },

//     endAt: Date,
//     timezone: String,

//     locationType: {
//       type: String,
//       enum: ["in_person", "online"],
//     },

//     venue: String,
//     address: String,
//     city: String,

//     visibility: {
//       type: String,
//       enum: ["public", "private"],
//       default: "public",
//     },

//     ticketType: {
//       type: String,
//       enum: ["free", "paid", "approval", "registration"],
//     },

//     price: {
//       type: Number,
//       default: 0,
//     },

//     currency: {
//       type: String,
//       default: "USD",
//     },

//     capacity: {
//       type: Number,
//       default: null,
//     },

//     requireApproval: {
//       type: Boolean,
//       default: false,
//     },

//     categories: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Category",
//       },
//     ],
//   },
//   { timestamps: true },
// );

// export default mongoose.model("Event", eventSchema);

// ============================================================
// BACKEND
// ============================================================

// src/models/Event.js

import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: String,
    coverUrl: String,
    theme: String,

    startAt: {
      type: Date,
      required: true,
    },

    endAt: Date,
    timezone: String,

    locationType: {
      type: String,
      enum: ["in_person", "online"],
      default: "in_person",
    },

    venue: String,
    address: String,
    city: String,

    // [6] Real backend geospatial search
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: undefined,
      },
      coordinates: {
        type: [Number],
        default: undefined,
      },
    },

    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },

    ticketType: {
      type: String,
      enum: ["free", "paid", "approval", "registration"],
    },

    price: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: "USD",
    },

    capacity: {
      type: Number,
      default: null,
    },

    requireApproval: {
      type: Boolean,
      default: false,
    },

    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    // [4] Featured events
    featured: {
      type: Boolean,
      default: false,
    },

    // [3] Popularity
    popularityScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

eventSchema.index({
  location: "2dsphere",
});

eventSchema.index({
  startAt: 1,
});

eventSchema.index({
  city: 1,
});

eventSchema.index({
  categories: 1,
});

eventSchema.index({
  featured: 1,
});

eventSchema.index({
  popularityScore: -1,
});

export default mongoose.model("Event", eventSchema);
