// Run with: node migrateUsernameToUserId.js

const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");

async function migrate() {
  try {
    const mongoUrl = process.env.MONGO_URL || process.env.VITE_MONGO_URL;
    if (!mongoUrl) {
      console.error("❌ MONGO_URL is not set in .env");
      process.exit(1);
    }

    await mongoose.connect(mongoUrl);
    console.log("✅ Connected to MongoDB");

    const postsCollection = mongoose.connection.db.collection("posts");

    // Find posts with username but missing/invalid userId
    const posts = await postsCollection
      .find({
        username: { $exists: true, $ne: null },
        $or: [{ userId: { $exists: false } }, { userId: null }],
      })
      .toArray();

    console.log(`📦 Found ${posts.length} posts to migrate`);

    let updatedCount = 0;
    const skippedNoUsername = [];
    const skippedNoUser = [];

    for (const post of posts) {
      if (!post.username) {
        console.warn(`⚠️ Post ${post._id} has no username, skipping...`);
        skippedNoUsername.push(post._id);
        continue;
      }

      const user = await User.findOne({ username: post.username });
      if (!user) {
        console.warn(
          `⚠️ No user found for username "${post.username}" (postId: ${post._id}), skipping...`
        );
        skippedNoUser.push({ postId: post._id, username: post.username });
        continue;
      }

      await postsCollection.updateOne(
        { _id: post._id },
        { $set: { userId: user._id }, $unset: { username: "" } }
      );

      updatedCount++;
    }

    console.log(`\n✅ Migration complete! Updated ${updatedCount} posts.`);

    // Summary logs
    if (skippedNoUsername.length > 0) {
      console.log("\n⚠️ Skipped posts with no username:");
      skippedNoUsername.forEach((id) => console.log(`   - ${id}`));
    }

    if (skippedNoUser.length > 0) {
      console.log("\n⚠️ Skipped posts with username but no matching User:");
      skippedNoUser.forEach((p) =>
        console.log(`   - PostId: ${p.postId}, Username: ${p.username}`)
      );
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrate();
