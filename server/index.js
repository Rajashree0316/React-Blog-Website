const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const cors = require("cors");

// Routes
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");
const tagsRoute = require("./routes/tags");
const trendingRoute = require("./routes/trending");
const commentRoutes = require("./routes/comments");
const quoteRoute = require("./routes/quote");
const statsRoute = require("./routes/stats");
const newsletterRoute = require("./routes/newsletter");
const securityRoute = require("./routes/security");
const preferencesRoute = require("./routes/preferences");

dotenv.config();

// Ensure images folder exists
if (!fs.existsSync("images")) fs.mkdirSync("images");

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log("Connection error:", err.message));

// Middleware
app.use("/images", express.static(path.join(__dirname, "/images")));

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://blogspace-reactweb.netlify.app",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


// File upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "images"),
  filename: (req, file, cb) => cb(null, req.body.name),
});
const upload = multer({ storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    res.status(200).json("File has been uploaded");
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

// Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/tags", tagsRoute);
app.use("/api/trending", trendingRoute);
app.use("/api/comments", commentRoutes);
app.use("/api/quote", quoteRoute);
app.use("/api/stats", statsRoute);
app.use("/api/newsletter", newsletterRoute);
app.use("/api/security", securityRoute); // ✅ Different path
app.use("/api/preferences", preferencesRoute);

// Start server on dynamic port (Render requirement)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend is running on port ${PORT}`));
