const router = require("express").Router();
const mongoose = require("mongoose");
const Preferences = require("../models/Preferences");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET preferences
router.get("/:userId", async (req, res) => {
  if (!isValidObjectId(req.params.userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    let preferences = await Preferences.findOne({ userId: req.params.userId });

    if (!preferences) {
      preferences = new Preferences({ userId: req.params.userId });
      await preferences.save();
    }

    res.status(200).json(preferences);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE preferences
router.put("/:userId", async (req, res) => {
  if (!isValidObjectId(req.params.userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const updated = await Preferences.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: req.body },
      { upsert: true, new: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update preferences" });
  }
});

module.exports = router;
