const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Subscriber = require("../models/Subscriber");

router.get("/", async (req, res) => {
  try {
    const [postsCount, totalViewsResult, commentsCount, subscribersCount] = await Promise.all([
      Post.countDocuments(),
      Post.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]),
      Comment.countDocuments(),
      Subscriber.countDocuments(),
    ]);

    res.status(200).json({
      posts: postsCount,
      views: totalViewsResult[0]?.total || 0,
      comments: commentsCount,
      subscribers: subscribersCount,
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

module.exports = router;
