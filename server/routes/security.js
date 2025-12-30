const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

// Enable 2FA
router.post("/:userId/enable-2fa", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json("User not found");

    const secret = speakeasy.generateSecret({ name: `MyApp (${user.email})` });
    user.twoFASecret = secret.base32;
    user.twoFAEnabled = true;
    await user.save();

    const qrCode = await qrcode.toDataURL(secret.otpauth_url);
    res.json({ message: "2FA enabled", qrCode });
  } catch (err) {
    res.status(500).json({ message: "Failed to enable 2FA", error: err.message });
  }
});

// Disable 2FA
router.post("/:userId/disable-2fa", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json("User not found");

    user.twoFASecret = null;
    user.twoFAEnabled = false;
    await user.save();

    res.json({ message: "2FA disabled successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to disable 2FA", error: err.message });
  }
});

// Validate 2FA
router.post("/:userId/validate-2fa", authMiddleware, async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user || !user.twoFASecret) return res.status(400).json("2FA not setup");

    const isValid = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: "base32",
      token,
    });

    if (!isValid) return res.status(400).json("Invalid token");
    res.status(200).json({ message: "2FA verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "2FA verification failed", error: err.message });
  }
});

// Get sessions
router.get("/:userId/sessions", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json("User not found");

    res.json({ sessions: user.sessions || [] });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

// Revoke session
router.post("/:userId/revoke-session", authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json("User not found");

    if (Array.isArray(user.sessions)) {
      user.sessions = user.sessions.filter((s) => s._id.toString() !== sessionId);
      await user.save();
    }

    res.json({ message: "Session revoked." });
  } catch (err) {
    res.status(500).json({ message: "Failed to revoke session", error: err.message });
  }
});

module.exports = router;
