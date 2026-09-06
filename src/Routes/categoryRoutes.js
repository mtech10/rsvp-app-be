// import express from "express";
// import Category from "../models/Category.js";

// const router = express.Router();

// router.get("/", async (req, res) => {
//   try {
//     const categories = await Category.find({
//       isActive: true,
//     }).sort({ name: 1 });

//     return res.status(200).json({
//       success: true,
//       categories,
//     });
//   } catch (error) {
//     console.error("GET CATEGORIES ERROR:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// });

// export default router;

// src/Routes/categoryRoutes.js

import express from "express";

import {
  getCategories,
  followCategory,
  unfollowCategory,
  getFollowedCategories,
} from "../controllers/categoryController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getCategories);

router.get("/followed", protect, getFollowedCategories);

router.post("/:categoryId/follow", protect, followCategory);

router.delete("/:categoryId/follow", protect, unfollowCategory);

export default router;
