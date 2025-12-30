const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

// GET /api/trending?tagCategory=xxx
router.get("/", async (req, res) => {
  try {
    const tagsCategory = req.query.tagCategory;
    const filter = tagsCategory ? { tagCategories: { $in: [tagsCategory] } } : {};

    const trendingPosts = await Post.find(filter)
      .sort({ views: -1 })
      .limit(5)
      .select("title slug views createdAt tags");

    res.status(200).json(trendingPosts);
  } catch (err) {
    console.error("Trending fetch failed:", err);
    res.status(500).json({ message: "Trending fetch failed", error: err.message });
  }
});

module.exports = router;
