const mongoose = require("mongoose");

const PreferencesSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },

  // Notifications you WANT
  newLikes: { type: Boolean, default: true },
  newComments: { type: Boolean, default: true },
  newFollowers: { type: Boolean, default: true },

  // Optional privacy (can keep or remove later)
  publicProfile: { type: Boolean, default: true },
  showEmail: { type: Boolean, default: false },
});

module.exports = mongoose.model("Preferences", PreferencesSchema);
