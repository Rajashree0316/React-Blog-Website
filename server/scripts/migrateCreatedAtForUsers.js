// Run with: node migrateCreatedAtForUsers.js

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

    // Find users without createdAt
    const users = await User.find({ createdAt: { $exists: false } }).lean();
    console.log(`📦 Found ${users.length} users missing createdAt`);

    let updatedCount = 0;
    for (const user of users) {
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            createdAt: user._id.getTimestamp(), // fallback: use ObjectId timestamp
            updatedAt: new Date(),
          },
        }
      );
      updatedCount++;
    }

    console.log(`\n✅ Migration complete! Updated ${updatedCount} users.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrate();
