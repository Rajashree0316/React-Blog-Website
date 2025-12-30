const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;
    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPass,
    });

    const user = await newUser.save();
    const { password: pwd, ...others } = user._doc;
    res.status(201).json(others);
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username: new RegExp(`^${username}$`, "i") });
    if (!user) return res.status(400).json("Wrong credentials!");

    const validated = await bcrypt.compare(password, user.password);
    if (!validated) return res.status(400).json("Wrong credentials!");

    if (!process.env.JWT_SECRET) return res.status(500).json("Server configuration error: JWT secret missing");

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const sessionId = uuidv4();
    const sessionInfo = {
      _id: sessionId,
      device: req.headers["user-agent"] || "unknown",
      ip: req.ip,
      loginTime: new Date(),
      isCurrent: true,
    };

    user.sessions = [...(user.sessions || []), sessionInfo];
    await user.save();

    const { password: pwd, ...others } = user._doc;
    res.status(200).json({ user: others, token });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

module.exports = router;
