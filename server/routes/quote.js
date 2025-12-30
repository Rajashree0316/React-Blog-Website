const express = require("express");
const axios = require("axios");
const router = express.Router();

// GET /api/quote — returns daily wisdom
router.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://zenquotes.io/api/random", {
      timeout: 5000, // 5s timeout
    });

    if (!Array.isArray(response.data) || !response.data[0]) {
      throw new Error("Invalid quote format");
    }

    const quoteData = response.data[0];
    res.status(200).json({
      text: quoteData.q,
      author: quoteData.a || "Unknown",
    });
  } catch (error) {
    console.error("Error fetching quote:", error.message);

    // 🧠 Fallback quote in case ZenQuotes fails
    const fallbackQuote = {
      text: "Keep your face always toward the sunshine—and shadows will fall behind you.",
      author: "Walt Whitman",
    };

    res.status(200).json(fallbackQuote); // ✅ Send fallback instead of 500
  }
});

module.exports = router;
