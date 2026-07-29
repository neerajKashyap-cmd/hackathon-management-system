const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { sendOTPEmail } = require("../utils/emailService");

/**
 * Generate 6-digit OTP Code
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register a new user & send OTP for email verification
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, bio, skills } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const lowerEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: lowerEmail });

    if (user && user.isEmailVerified) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const allowedRole = ["participant", "judge", "organizer", "admin"].includes(role) ? role : "participant";
    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    if (user && !user.isEmailVerified) {
      // Update unverified existing account with new OTP & details
      user.name = name;
      user.password = password;
      user.role = allowedRole;
      user.bio = bio || "";
      user.skills = Array.isArray(skills) ? skills : (skills ? skills.split(",").map(s => s.trim()) : []);
      user.otpCode = otpCode;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      // Create new user record
      user = await User.create({
        name,
        email: lowerEmail,
        password,
        role: allowedRole,
        bio: bio || "",
        skills: Array.isArray(skills) ? skills : (skills ? skills.split(",").map(s => s.trim()) : []),
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        isEmailVerified: false,
        otpCode,
        otpExpires,
      });
    }

    // Send OTP Email using Nodemailer Gmail SMTP
    await sendOTPEmail(user.email, otpCode, user.name);

    res.status(200).json({
      requiresOtp: true,
      email: user.email,
      message: "Verification OTP code sent to your email address.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during registration", error: error.message });
  }
};

// @desc    Verify OTP and activate account
// @route   POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP code are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({ message: "User account not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Account email is already verified" });
    }

    if (user.otpCode !== otp.trim()) {
      return res.status(400).json({ message: "Invalid OTP code. Please check your email." });
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ message: "OTP code has expired. Please click Resend OTP." });
    }

    // Activate user
    user.isEmailVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      skills: user.skills,
      bookmarkedHackathons: user.bookmarkedHackathons || [],
      token: generateToken(user._id, user.role),
      message: "Email verified successfully! Welcome to HackSphere.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during OTP verification", error: error.message });
  }
};

// @desc    Resend OTP to email
// @route   POST /api/auth/resend-otp
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email address is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({ message: "User account not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Account email is already verified" });
    }

    const otpCode = generateOTP();
    user.otpCode = otpCode;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(user.email, otpCode, user.name);

    res.status(200).json({
      success: true,
      message: "New OTP code sent to your email address.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error resending OTP", error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() }).populate("bookmarkedHackathons");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account is blocked by admin." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      const otpCode = generateOTP();
      user.otpCode = otpCode;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      await sendOTPEmail(user.email, otpCode, user.name);

      return res.status(200).json({
        requiresOtp: true,
        email: user.email,
        message: "Email verification required. OTP sent to your email.",
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`,
      bio: user.bio || "",
      skills: user.skills || [],
      bookmarkedHackathons: user.bookmarkedHackathons || [],
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get logged-in user's profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("bookmarkedHackathons").select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, bio, skills, avatar, password } = req.body;

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (skills !== undefined) {
      user.skills = Array.isArray(skills) ? skills : skills.split(",").map(s => s.trim());
    }
    if (avatar) user.avatar = avatar;
    if (password) user.password = password;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      skills: user.skills,
      bookmarkedHackathons: user.bookmarkedHackathons,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Bookmark or unbookmark hackathon
// @route   POST /api/auth/bookmark/:hackathonId
const toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { hackathonId } = req.params;

    const index = user.bookmarkedHackathons.indexOf(hackathonId);
    if (index === -1) {
      user.bookmarkedHackathons.push(hackathonId);
    } else {
      user.bookmarkedHackathons.splice(index, 1);
    }

    await user.save();
    res.json({ bookmarkedHackathons: user.bookmarkedHackathons });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  getMe,
  updateProfile,
  toggleBookmark,
};
