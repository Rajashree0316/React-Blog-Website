const router = require("express").Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Tag = require("../models/Tag");
const Preferences = require("../models/Preferences");

// Helper: validate ObjectId
const isValidObjectId = id => mongoose.Types.ObjectId.isValid(id);

// 1️⃣ Update Profile Info
router.put("/:id/profile", async (req, res) => {
  if (req.body.userId !== req.params.id) return res.status(401).json("You can update only your account!");

  try {
    const updateData = { ...req.body };
    delete updateData.password;

    const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2️⃣ Update Password
router.put("/:id/password", async (req, res) => {
  if (req.body.userId !== req.params.id) return res.status(401).json("You can update only your account!");

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json("User not found");

    const valid = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!valid) return res.status(403).json("Current password is incorrect.");

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3️⃣ Delete User & Related Data
router.delete("/:id", async (req, res) => {
  if (req.body.userId !== req.params.id) return res.status(401).json("You can delete only your account!");

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json("User not found!");

    const personalPosts = await Post.find({ userId: user._id });
    await Comment.deleteMany({ userId: user._id });
    await Post.updateMany({ likedBy: user._id }, { $pull: { likedBy: user._id }, $inc: { likes: -1 } });
    await Post.deleteMany({ userId: user._id });
    await User.findByIdAndDelete(user._id);

    res.status(200).json({
      message: "User and related data deleted successfully",
      deletedUser: user,
      deletedPosts: personalPosts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// 5️⃣ Get User by Exact Username (case-insensitive) includes tags mentioned
router.get("/username/:username", async (req, res) => {
  try {
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${req.params.username}$`, "i") },
    })
      .populate("followedTags", "name")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    // Tags mentioned by this user
    const tagsMentionedRaw = await Post.aggregate([
      { $match: { userId: user._id } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags" } },
      { $project: { _id: 0, tag: "$_id" } },
    ]);
    const tagsMentioned = tagsMentionedRaw.map((t) => t.tag);

    const { password, email, ...others } = user;

    // Check preferences
    const preferences = await Preferences.findOne({ userId: user._id });
    const showEmail = preferences?.showEmail || false;

    res.status(200).json({
      ...others,
      ...(showEmail && { email }),

      followersCount: user.followers?.length || 0,
      followingsCount: user.followings?.length || 0,
      followedTags: user.followedTags || [],
      tagsMentioned,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 4️⃣ Get user by ID  ✅ includes tagsMentioned

router.get("/:id", async (req, res) => {
  if (!isValidObjectId(req.params.id))
    return res.status(400).json({ message: "Invalid user ID" });
  try {
    const user = await User.findById(req.params.id)
      .populate("followedTags", "name")
      .lean();
    if (!user) return res.status(404).json("User not found");

    // Fetch stats and tagsMentioned
    const [postsCount, commentsCount, tagsMentionedRaw] = await Promise.all([
      Post.countDocuments({ userId: user._id }),
      Comment.countDocuments({ userId: user._id }),
      Post.aggregate([
        { $match: { userId: user._id } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags" } },
        { $project: { _id: 0, tag: "$_id" } },
      ]),
    ]);

    const tagsMentioned = tagsMentionedRaw.map((t) => t.tag);

    const { password, email, ...others } = user;

    // Fetch preferences
    const preferences = await Preferences.findOne({ userId: user._id });
    const showEmail = preferences?.showEmail || false;

    res.status(200).json({
      ...others,
      ...(showEmail && { email }), // include email conditionally

      postsCount,
      commentsCount,
      followersCount: user.followers?.length || 0,
      followingsCount: user.followings?.length || 0,
      followedTags: Array.isArray(user.followedTags)
        ? user.followedTags.map(t => (typeof t === "string" ? t : t.name))
        : [],
      tagsMentioned,

    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// 6️⃣ Get Followers (with optional pagination)
router.get("/:id/followers", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate({ path: "followers", select: "username profilePic" });
    const followers = (user?.followers || []).filter(Boolean);
    res.status(200).json(followers);
  } catch {
    res.status(500).json({ message: "Error fetching followers" });
  }
});

// 7️⃣ Get Followings
router.get("/:id/followings", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("followings", "username profilePic");
    res.status(200).json(user.followings || []);
  } catch {
    res.status(500).json({ message: "Error fetching followings" });
  }
});

// 8️⃣ Follow/Unfollow User
router.put("/:id/follow", async (req, res) => {
  const targetUserId = req.params.id;
  const currentUserId = req.body.userId;

  if (targetUserId === currentUserId) return res.status(400).json("You can't follow/unfollow yourself.");

  try {
    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);
    if (!targetUser || !currentUser) return res.status(404).json("User not found.");

    targetUser.followers = targetUser.followers || [];
    currentUser.followings = currentUser.followings || [];

    const alreadyFollowing = targetUser.followers.includes(currentUserId);

    if (!alreadyFollowing) {
      targetUser.followers.push(currentUserId);
      currentUser.followings.push(targetUserId);
      await targetUser.save();
      await currentUser.save();
      return res.status(200).json("User followed.");
    } else {
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);
      currentUser.followings = currentUser.followings.filter(id => id.toString() !== targetUserId);
      await targetUser.save();
      await currentUser.save();
      return res.status(200).json("User unfollowed.");
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 9️⃣ Get Bookmarked Posts
router.get("/:id/bookmarked", async (req, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid userId" });
  try {
    const posts = await Post.find({ savedBy: req.params.id });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookmarks" });
  }
});

// 1️⃣0️⃣ Get Readers (exclude author, include their post counts)
router.get("/readers/:username", async (req, res) => {
  try {
    const author = await User.findOne({ username: { $regex: new RegExp(`^${req.params.username}$`, "i") } });
    if (!author) return res.status(404).json({ message: "Author not found" });

    const readers = await User.find({ _id: { $ne: author._id } });
    const readersWithPosts = await Promise.all(readers.map(async reader => {
      const postCount = await Post.countDocuments({ userId: reader._id });
      return {
        _id: reader._id,
        username: reader.username,
        fullName: reader.fullName,
        profilePic: reader.profilePic,
        title: reader.title,
        postCount,
        createdAt: reader.createdAt,
      };
    }));

    res.status(200).json(readersWithPosts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch readers", error: err.message });
  }
});

// 1️⃣1️⃣ Get User by Query (autocomplete)
router.get("/", async (req, res) => {
  const username = req.query.username;
  try {
    if (!username) {
      const users = await User.find({}, "username profilePic");
      return res.status(200).json(users);
    }

    const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, "i") } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
