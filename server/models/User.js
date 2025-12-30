const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      default: function () {
        return this._id;
      },
      index: true,
      unique: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    
    profilePic: { type: String, default: "" },
    location: { type: String, default: "" },
    bio: { type: String, default: "" },
    website: { type: String, default: "" },
    pronouns: { type: String, default: "" },
    work: { type: String, default: "" },
    education: { type: String, default: "" },
    
    socialMedia: {
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
      pinterest: { type: String, default: "" },
    },
    selectedSocials: {
      facebook: { type: Boolean, default: false },
      twitter: { type: Boolean, default: false },
      instagram: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: false },
      pinterest: { type: Boolean, default: false },
    },
    languages: { type: String, default: "" },
    exploring: { type: String, default: "" },
    strength: { type: String, default: "" },
    workingOn: { type: String, default: "" },
    favoriteTopics: { type: String, default: "" },
    
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followings: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followedTags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ], 
    tagsMentioned: [
  {
    type: String, // store tag names directly
    lowercase: true,
    trim: true,
  },
],

    twoFASecret: { type: String },
    twoFAEnabled: { type: Boolean, default: false },
    sessions: [
      {
        _id: { type: String },
        device: String,
        ip: String,
        loginTime: Date,
        isCurrent: Boolean,
      },
    ],
  },
  { timestamps: true } // ✅ ensures createdAt & updatedAt
);

module.exports = mongoose.model("User", UserSchema);
