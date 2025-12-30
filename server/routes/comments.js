const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const sanitizeHtml = require("sanitize-html");
const axios = require("axios");

const Comment = require("../models/Comment");
const Post = require("../models/Post");
const User = require("../models/User");

// Helper: validate ObjectId
const isValidObjectId = id => mongoose.Types.ObjectId.isValid(id);

// Helper: sanitize text
const cleanText = (text) => sanitizeHtml(text, {
  allowedTags: ["b", "i", "em", "strong", "a", "ul", "ol", "li", "p", "br"],
  allowedAttributes: { a: ["href", "target"] },
});

// Helper: flatten comment with user info and nested replies
const formatComment = (comment) => {
  if (!comment) return null;
  const obj = typeof comment.toObject === "function" ? comment.toObject() : comment;

  return {
    ...obj,
    userId: obj.userId?._id ? obj.userId._id.toString() : obj.userId?.toString?.() || obj.userId,
    username: obj.userId?.username || obj.username,
    profilePic: obj.userId?.profilePic || obj.profilePic,
    replies: obj.replies ? obj.replies.map(formatComment) : [],
  };
};


// ==========================
// GET comments for a post
// ==========================
router.get("/:postId", async (req, res) => {
  const { postId } = req.params;
  if (!isValidObjectId(postId)) return res.status(400).json({ error: "Invalid post ID" });

  try {
    const comments = await Comment.find({ postId, parentComment: null })
      .populate("userId", "username profilePic")
      .populate({
        path: "replies",
        populate: [
          { path: "userId", select: "username profilePic" },
          { path: "replies", populate: { path: "userId", select: "username profilePic" } },
        ],
      })
      .sort({ createdAt: -1 });

    res.json(comments.map(formatComment));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================
// Add a new comment
// ==========================
router.post("/", async (req, res) => {
  try {
    const { postId, userId, text } = req.body;
    if (!isValidObjectId(postId) || !isValidObjectId(userId)) return res.status(400).json({ error: "Invalid IDs" });
    if (!text || text.replace(/<(.|\n)*?>/g, "").trim() === "") return res.status(400).json({ error: "Comment cannot be empty" });

    const user = await User.findById(userId).select("username profilePic");
    if (!user) return res.status(404).json({ error: "User not found" });

    const comment = new Comment({ postId, userId, username: user.username, profilePic: user.profilePic, text: cleanText(text) });
    const saved = await comment.save();

    await Post.findByIdAndUpdate(postId, { $inc: { comments: 1 } });

    // notify post owner
    const post = await Post.findById(postId);
    if (post && String(post.userId) !== String(userId)) {
      axios.post(`${process.env.BASE_URL || "http://localhost:5000"}/api/notifications`, {
        userId: post.userId,
        actorId: userId,
        type: "comment",
        content: "commented on your post",
        postId,
      }).catch(() => { });
    }

    res.status(201).json({ ...saved.toObject(), userId, username: user.username, profilePic: user.profilePic });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================
// Add a reply to a comment
// ==========================
router.post("/reply/:parentId", async (req, res) => {
  try {
    const { parentId } = req.params;
    const { userId, text } = req.body;

    if (!isValidObjectId(parentId) || !isValidObjectId(userId)) return res.status(400).json({ error: "Invalid IDs" });
    if (!text || text.replace(/<(.|\n)*?>/g, "").trim() === "") return res.status(400).json({ error: "Reply cannot be empty" });

    const parent = await Comment.findById(parentId);
    if (!parent) return res.status(404).json({ error: "Parent comment not found" });

    const user = await User.findById(userId).select("username profilePic");
    if (!user) return res.status(404).json({ error: "User not found" });

    const newReply = new Comment({
      postId: parent.postId,
      parentComment: parentId,
      userId,
      username: user.username,
      profilePic: user.profilePic,
      text: cleanText(text),
    });

    const saved = await newReply.save();
    await Comment.findByIdAndUpdate(parentId, { $push: { replies: saved._id } });
    await Post.findByIdAndUpdate(parent.postId, { $inc: { comments: 1 } });

    res.status(201).json({ ...saved.toObject(), userId, username: user.username, profilePic: user.profilePic });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================
// Recursive like/dislike helper
// ==========================
const updateVoteRecursive = async (commentId, userId, type) => {
  const comment = await Comment.findById(commentId);
  if (!comment) return null;

  const arrayField = type === "like" ? "likedBy" : "dislikedBy";
  if (!comment[arrayField]) comment[arrayField] = [];

  if (comment[arrayField].includes(userId)) return false;

  comment[arrayField].push(userId);
  comment[type === "like" ? "likes" : "dislikes"] = comment[arrayField].length;
  await comment.save();
  return { likes: comment.likes || 0, dislikes: comment.dislikes || 0 };
};

// ==========================
// Like a comment
// ==========================
router.post("/:id/like", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!isValidObjectId(req.params.id) || !isValidObjectId(userId)) return res.status(400).json({ error: "Invalid IDs" });

    const result = await updateVoteRecursive(req.params.id, userId, "like");
    if (!result) return res.status(400).json({ error: "Already liked" });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================
// Dislike a comment
// ==========================
router.post("/:id/dislike", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!isValidObjectId(req.params.id) || !isValidObjectId(userId)) return res.status(400).json({ error: "Invalid IDs" });

    const result = await updateVoteRecursive(req.params.id, userId, "dislike");
    if (!result) return res.status(400).json({ error: "Already disliked" });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
// ==========================
// Get recent comments by a specific user
// ==========================
router.get("/recent/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) return res.status(400).json({ error: "Invalid user ID" });

  try {
    const comments = await Comment.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("postId", "title")   // ✅ get post title
      .populate("userId", "username") // ✅ get username
      .exec()

    res.json(comments.map(formatComment));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================
// Delete comment with nested replies
// ==========================
const deleteCommentWithReplies = async (commentId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) return 0;

  let deletedCount = 1;
  if (comment.replies?.length) {
    for (const replyId of comment.replies) {
      deletedCount += await deleteCommentWithReplies(replyId);
    }
  }

  await Comment.findByIdAndDelete(commentId);
  return deletedCount;
};

router.delete("/:id", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!isValidObjectId(req.params.id) || !isValidObjectId(userId)) return res.status(400).json({ error: "Invalid IDs" });

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (String(comment.userId) !== String(userId)) return res.status(403).json({ error: "Not authorized" });

    const deletedCount = await deleteCommentWithReplies(req.params.id);
    await Post.findByIdAndUpdate(comment.postId, { $inc: { comments: -deletedCount } });

    res.json({ message: "Deleted successfully", deletedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
