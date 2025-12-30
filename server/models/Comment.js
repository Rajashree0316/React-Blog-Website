const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ track user properly
    username: { type: String,required:true }, 
    text: { type: String, required: true },

    avatarUrl: String, // optional legacy field
    profilePic: String, // ✅ used in your code
    title: String, // optional
    time: { type: Date, default: Date.now },

    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },

    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // ✅ fixed to ObjectId
    dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }], // nested replies
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
  },
  { timestamps: true }
);

// For fetching recent comments quickly
CommentSchema.index({ postId: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", CommentSchema);
