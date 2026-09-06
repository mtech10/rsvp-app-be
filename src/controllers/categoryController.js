import Category from "../models/Category.js";
import User from "../models/User.js";

export async function getCategories(req, res) {
  try {
    const categories = await Category.find({
      isActive: true,
    }).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function followCategory(req, res) {
  try {
    const { categoryId } = req.params;

    const category = await Category.findOne({
      _id: categoryId,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: {
        followedCategories: category._id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Category followed.",
    });
  } catch (error) {
    console.error("FOLLOW CATEGORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

export async function unfollowCategory(req, res) {
  try {
    const { categoryId } = req.params;

    await User.findByIdAndUpdate(req.user._id, {
      $pull: {
        followedCategories: categoryId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Category unfollowed.",
    });
  } catch (error) {
    console.error("UNFOLLOW CATEGORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

export async function getFollowedCategories(req, res) {
  try {
    const user = await User.findById(req.user._id).populate(
      "followedCategories",
      "name description",
    );

    return res.status(200).json({
      success: true,
      categories: user?.followedCategories || [],
    });
  } catch (error) {
    console.error("GET FOLLOWED CATEGORIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}
