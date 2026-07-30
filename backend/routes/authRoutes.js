const express = require("express");
const router = express.Router();
const {
  registerUser,
  googleAuth,
  verifyOTP,
  resendOTP,
  loginUser,
  getMe,
  updateProfile,
  toggleBookmark,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/google", googleAuth);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.post("/bookmark/:hackathonId", protect, toggleBookmark);

module.exports = router;