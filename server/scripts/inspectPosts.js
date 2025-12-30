// quick script: inspectPosts.js
const mongoose = require("mongoose");
require("dotenv").config();

const Post = require("../models/Post");

async function check() {
  await mongoose.connect(process.env.MONGO_URL);
  const posts = await Post.find({}, { username: 1, userId: 1 }).lean();
  console.log(posts);
  process.exit();
}
check();
