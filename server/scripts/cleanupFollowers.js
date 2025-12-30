// Run with: node cleanupFollowers.js

const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");

async function cleanupFollowers() {
  try {
    const mongoUrl = process.env.MONGO_URL || process.env.VITE_MONGO_URL;
    if (!mongoUrl) {
      console.error("❌ MONGO_URL is not set in .env");
      process.exit(1);
    }

    await mongoose.connect(mongoUrl);
    console.log("✅ Connected to MongoDB");

    const users = await User.find({});
    let totalFixed = 0;

    for (const user of users) {
      const validFollowers = [];
      for (const followerId of user.followers) {
        const exists = await User.exists({ _id: followerId });
        if (exists) validFollowers.push(followerId);
      }

      if (validFollowers.length !== user.followers.length) {
        console.log(
          `🛠️ Fixing user ${user.username}: ${user.followers.length} → ${validFollowers.length}`
        );
        user.followers = validFollowers;
        await user.save();
        totalFixed++;
      }
    }

    console.log(`\n✅ Cleanup complete! Fixed ${totalFixed} users.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Cleanup failed:", err);
    process.exit(1);
  }
}

cleanupFollowers();
