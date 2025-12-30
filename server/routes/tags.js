// routes/tags.js
const router = require("express").Router();
const Tag = require("../models/Tag");
const User = require("../models/User");
const Post = require("../models/Post");

// 🧩 Helper: lowercase tag names
const normalizeTag = (name) => name.trim().toLowerCase();


// 1️⃣ FOLLOW TAG
router.put("/follow/:tagName", async (req, res) => {
  const { userId } = req.body;
  const tagName = normalizeTag(req.params.tagName);

  if (!userId || !tagName)
    return res.status(400).json({ message: "Missing userId or tagName" });

  try {
    const user = await User.findById(userId);
    let tag = await Tag.findOne({ name: tagName });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!tag) {
      tag = await new Tag({ name: tagName, followers: [] }).save();
    }

    if (!user.followedTags.includes(tag._id)) {
      user.followedTags.push(tag._id);
      tag.followers.push(user._id);
      await Promise.all([user.save(), tag.save()]);
      return res.status(200).json({ message: `Followed ${tagName}` });
    }

    return res.status(200).json({ message: `Already following ${tagName}` });
  } catch (err) {
    console.error("Error following tag:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// 2️⃣ UNFOLLOW TAG
router.put("/unfollow/:tagName", async (req, res) => {
  const { userId } = req.body;
  const tagName = normalizeTag(req.params.tagName);

  if (!userId || !tagName)
    return res.status(400).json({ message: "Missing userId or tagName" });

  try {
    const user = await User.findById(userId);
    const tag = await Tag.findOne({ name: tagName });

    if (!user || !tag)
      return res.status(404).json({ message: "User or tag not found" });

    user.followedTags = user.followedTags.filter(
      (t) => t.toString() !== tag._id.toString()
    );
    tag.followers = tag.followers.filter(
      (u) => u.toString() !== user._id.toString()
    );

    await Promise.all([user.save(), tag.save()]);
    res.status(200).json({ message: `Unfollowed ${tagName}` });
  } catch (err) {
    console.error("Error unfollowing tag:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// 3️⃣ GET ALL TAGS (with post counts)
router.get("/", async (req, res) => {
  try {
    const sortOption =
      req.query.sort === "popular" ? { count: -1 } : { name: 1 };

    const tagStats = await Post.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: sortOption },
    ]);

    const tags = tagStats.map((t) => ({
      name: t._id,
      count: t.count,
    }));

    res.status(200).json(tags);
  } catch (err) {
    console.error("Error fetching tags:", err);
    res.status(500).json({ message: "Failed to fetch tags" });
  }
});


// 4️⃣ GET POSTS BY TAG NAME
router.get("/:tagName/posts", async (req, res) => {
  try {
    const tagName = normalizeTag(req.params.tagName);
    const posts = await Post.find({ tags: { $in: [tagName] } })
      .populate("userId", "username profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    console.error("Error fetching posts for tag:", err);
    res.status(500).json({ message: "Failed to fetch posts for this tag" });
  }
});


// 5️⃣ GET TAG DETAILS (with follower count)
router.get("/:tagName", async (req, res) => {
  try {
    const tagName = normalizeTag(req.params.tagName);
    const tag = await Tag.findOne({ name: tagName }).populate(
      "followers",
      "username profilePic"
    );

    if (!tag)
      return res.status(404).json({ message: `Tag '${tagName}' not found` });

    res.status(200).json({
      name: tag.name,
      followersCount: tag.followers?.length || 0,
      followers: tag.followers,
    });
  } catch (err) {
    console.error("Error fetching tag details:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// 6️⃣ CREATE A NEW TAG
router.post("/", async (req, res) => {
  try {
    const name = normalizeTag(req.body.name);
    if (!name) return res.status(400).json({ message: "Tag name required" });

    const existing = await Tag.findOne({ name });
    if (existing) return res.status(400).json({ message: "Tag already exists" });

    const newTag = new Tag({ name, followers: [] });
    const saved = await newTag.save();

    res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating tag:", err);
    res.status(500).json({ message: "Failed to create tag" });
  }
});


// 7️⃣ DELETE TAG (admin or cleanup)
router.delete("/:tagName", async (req, res) => {
  try {
    const tagName = normalizeTag(req.params.tagName);
    const tag = await Tag.findOneAndDelete({ name: tagName });
    if (!tag) return res.status(404).json({ message: "Tag not found" });

    // remove from all users' followedTags
    await User.updateMany(
      { followedTags: tag._id },
      { $pull: { followedTags: tag._id } }
    );

    res.status(200).json({ message: `Tag '${tagName}' deleted` });
  } catch (err) {
    console.error("Error deleting tag:", err);
    res.status(500).json({ message: "Failed to delete tag" });
  }
});


// 8️⃣ GET ALL TAGS FOLLOWED BY A USER
router.get("/user/:userId/followed", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate(
      "followedTags",
      "name"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.followedTags || []);
  } catch (err) {
    console.error("Error fetching followed tags:", err);
    res.status(500).json({ message: "Failed to fetch followed tags" });
  }
});

module.exports = router;
