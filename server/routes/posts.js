const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Post = require("../models/Post");
const User = require("../models/User");

// Helper: validate ObjectId
const isValidObjectId = id => mongoose.Types.ObjectId.isValid(id);

/* ─────────── GET FEATURED POSTS ─────────── */
router.get("/featured", async (req, res) => {
  try {
    const posts = await Post.find({ featured: true }).sort({ createdAt: -1 });
    const postsWithProfiles = await Promise.all(posts.map(async post => {
      const user = await User.findById(post.userId, "profilePic username");
      return {
        ...post.toObject(),
        profilePic: user?.profilePic || "",
        username: user?.username || "Unknown"
      };
    }));
    res.json(postsWithProfiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/* ─────────── CREATE POST ─────────── */
router.post("/", async (req, res) => {
  try {
    const { title, desc, userId, photo, tags, featured } = req.body;
    if (!title || !desc || !userId) return res.status(400).json({ message: "Title, description, and userId are required" });
    if (!isValidObjectId(userId)) return res.status(400).json({ message: "Invalid userId" });

    const exists = await Post.findOne({ title });
    if (exists) return res.status(400).json({ message: "Post title already exists" });

    const newPost = new Post({ title, desc, userId, photo, tags, featured });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating post", error: err.message });
  }
});

/* ─────────── SMART SEARCH (supports text, tag, username) ─────────── */
router.get("/search", async (req, res) => {
  try {
    const { query = "" } = req.query;
    const searchQuery = query.trim();

    if (!searchQuery) return res.json([]);

    let posts = [];

    // ✅ Case 1: Tag search (#art)
    if (searchQuery.startsWith("#")) {
      const tag = searchQuery.slice(1);
      posts = await Post.find({
        tags: { $elemMatch: { $regex: new RegExp(`^${tag}$`, "i") } },
      }).sort({ createdAt: -1 });
      return res.json(posts);
    }

    // ✅ Case 2: Username search
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${searchQuery}$`, "i") },
    });

    if (user) {
      posts = await Post.find({ userId: user._id }).sort({ createdAt: -1 });
      return res.json(posts);
    }

    // ✅ Case 3: General title/desc search
    posts = await Post.find({
      $or: [
        { title: { $regex: searchQuery, $options: "i" } },
        { desc: { $regex: searchQuery, $options: "i" } },
        { tags: { $regex: searchQuery, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    return res.json(posts);
  } catch (err) {
    console.error("Smart search error:", err);
    res.status(500).json([]);
  }
});

/* ─────────── UPDATE POST ─────────── */
router.put("/:id", async (req, res) => {
  const { userId, title, desc, tags, photo } = req.body;

  if (!isValidObjectId(req.params.id))
    return res.status(400).json({ message: "Invalid post ID" });

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Optional: only owner can edit
    if (userId && post.userId.toString() !== userId) {
      return res.status(403).json({ message: "You can edit only your posts" });
    }

    post.title = title || post.title;
    post.desc = desc || post.desc;
    post.tags = tags || post.tags;
    if (photo) post.photo = photo;

    const updated = await post.save();
    res.json(updated);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Error updating post", error: err.message });
  }
});

/* ─────────── UPDATE POST ─────────── */
router.get("/:id", async (req, res) => {
  if (!isValidObjectId(req.params.id))
    return res.status(400).json({ message: "Invalid post ID" });

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // 🧠 Add this part
    const user = await User.findById(post.userId, "username profilePic");
    const postWithUser = {
      ...post.toObject(),
      username: user?.username || "Unknown",
      profilePic: user?.profilePic || "",
    };

    res.json(postWithUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching post" });
  }
});


/* ─────────── LIKE & UNLIKE ─────────── */
router.put("/:id/like", async (req, res) => {
  const { userId } = req.body;
  if (!isValidObjectId(req.params.id) || !isValidObjectId(userId)) return res.status(400).json({ message: "Invalid IDs" });

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.likedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
    if (!post.likedBy.includes(userId)) {
      post.likedBy.push(userId);
      post.likes++;
      await post.save();
    }
    res.json({ likesCount: post.likes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error liking post", error: err.message });
  }
});

router.put("/:id/unlike", async (req, res) => {
  const { userId } = req.body;
  if (!isValidObjectId(req.params.id) || !isValidObjectId(userId)) return res.status(400).json({ message: "Invalid IDs" });

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.likedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
    if (post.likedBy.includes(userId)) {
      post.likedBy = post.likedBy.filter(id => id.toString() !== userId);
      post.likes = Math.max(0, post.likes - 1);
      await post.save();
    }
    res.json({ likesCount: post.likes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error unliking post", error: err.message });
  }
});

/* ─────────── SAVE & UNSAVE ─────────── */
router.put("/:id/save", async (req, res) => {
  const { userId } = req.body;
  if (!isValidObjectId(req.params.id) || !isValidObjectId(userId)) return res.status(400).json({ message: "Invalid IDs" });

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.savedBy = Array.isArray(post.savedBy) ? post.savedBy : [];
    if (!post.savedBy.includes(userId)) post.savedBy.push(userId);
    post.saveCount = post.savedBy.length;
    await post.save();

    res.json({ saveCount: post.saveCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving post", error: err.message });
  }
});

router.put("/:id/unsave", async (req, res) => {
  const { userId } = req.body;
  if (!isValidObjectId(req.params.id) || !isValidObjectId(userId)) return res.status(400).json({ message: "Invalid IDs" });

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.savedBy = Array.isArray(post.savedBy) ? post.savedBy : [];
    post.savedBy = post.savedBy.filter(id => id.toString() !== userId);
    post.saveCount = post.savedBy.length;
    await post.save();

    res.json({ saveCount: post.saveCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error unsaving post", error: err.message });
  }
});

/* ─────────── GET SAVED POSTS ─────────── */
router.get("/saved/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) return res.status(400).json({ message: "Invalid userId" });

  try {
    const posts = await Post.find({ savedBy: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching saved posts", error: err.message });
  }
});

/* ─────────── VIEW & COMMENT COUNT ─────────── */
router.put("/:id/view", async (req, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid post ID" });

  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating views" });
  }
});

router.put("/:id/comment", async (req, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid post ID" });

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments++;
    await post.save();
    res.json({ comments: post.comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating comments" });
  }
});

/* ─────────── DELETE POST ─────────── */
router.delete("/:id", async (req, res) => {
  const { userId } = req.query;
  if (!isValidObjectId(req.params.id) || !isValidObjectId(userId)) return res.status(400).json({ message: "Invalid IDs" });

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.userId.toString() !== userId) return res.status(401).json({ message: "Unauthorized" });

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting post" });
  }
});


/* ─────────── GET ALL POSTS ─────────── */
router.get("/", async (req, res) => {
  const { user, userId, tag, sort = "Relevant", time = "Infinity" } = req.query;
  const now = new Date();
  const filter = {};

  try {
    // 🧩 If ?user=username is provided
    if (user) {
      const foundUser = await User.findOne({
        username: { $regex: new RegExp(`^${user}$`, "i") },
      });
      if (!foundUser)
        return res.status(404).json({ message: "User not found" });

      filter.userId = foundUser._id;
    }

    // 🧩 If ?userId=... is provided (fallback)
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId))
        return res.status(400).json({ message: "Invalid userId" });
      filter.userId = new mongoose.Types.ObjectId(userId);
    }

    // 🏷️ Tag filter
    if (tag)
      filter.tags = {
        $elemMatch: { $regex: new RegExp(`^${tag}$`, "i") },
      };

    // 🕒 Time filters
    if (time === "Week") filter.createdAt = { $gte: new Date(now - 7 * 864e5) };
    if (time === "Month")
      filter.createdAt = { $gte: new Date(now - 30 * 864e5) };
    if (time === "Year")
      filter.createdAt = { $gte: new Date(now - 365 * 864e5) };

    // 🧮 Sorting logic
    const sortOption = sort === "Top" ? { likes: -1 } : { createdAt: -1 };

    const posts = await Post.find(filter)
      .populate("userId", "username profilePic")
      .sort(sortOption);

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching posts" });
  }
});


/* ─────────── GET SINGLE POST ─────────── */
router.get("/:id", async (req, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid post ID" });

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching post" });
  }
});

module.exports = router;
