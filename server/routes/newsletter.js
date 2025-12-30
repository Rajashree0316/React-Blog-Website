const express = require("express");
const router = express.Router();
const Subscriber = require("../models/Subscriber");

// POST /api/newsletter — subscribe
router.post("/", async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) return res.status(400).json({ message: "Invalid email address" });

  try {
    const existing = await Subscriber.findOne({ email });
    if (existing) return res.status(400).json({ message: "Already subscribed" });

    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();

    res.status(201).json({ message: "Subscribed successfully" });
  } catch (err) {
    console.error("Subscription error:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

module.exports = router;
