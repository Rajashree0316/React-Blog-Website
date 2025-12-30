const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true, trim: true },
    desc: { type: String, required: true, trim: true },
    photo: { type: String, default: "" },
    profilePic: { type: String, default: "" },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tags: { type: [String], default: [], index: true },
    featured: { type: Boolean, default: false },

    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: { type: Number, default: 0 },
    views: { type: Number, default: 0 },

    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    saveCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
// ✅ Index for faster queries
PostSchema.index({ userId: 1 });
module.exports = mongoose.model("Post", PostSchema);
