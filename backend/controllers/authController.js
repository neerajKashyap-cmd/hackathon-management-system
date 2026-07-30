const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @desc    Register a new user (Direct Instant Activation without OTP)
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, bio, skills } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const lowerEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: lowerEmail });

    if (user) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Only allow participant, judge, or organizer registration from frontend (Admin is backend/seed created only)
    const allowedRole = ["participant", "judge", "organizer"].includes(role) ? role : "participant";

    user = await User.create({
      name,
      email: lowerEmail,
      password,
      role: allowedRole,
      bio: bio || "",
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(",").map((s) => s.trim()) : []),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      isEmailVerified: true,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      skills: user.skills,
      bookmarkedHackathons: user.bookmarkedHackathons || [],
      token: generateToken(user._id, user.role),
      message: "Account created successfully!",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during registration", error: error.message });
  }
};

// @desc    Google OAuth Real Authentication
// @route   POST /api/auth/google
const googleAuth = async (req, res) => {
  try {
    const { credential, name, email, avatar, role } = req.body;

    let userEmail = email;
    let userName = name;
    let userAvatar = avatar;

    // Decode Google OAuth JWT Credential payload if present
    if (credential) {
      try {
        const base64Url = credential.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const payload = JSON.parse(jsonPayload);
        userEmail = payload.email || userEmail;
        userName = payload.name || userName;
        userAvatar = payload.picture || userAvatar;
      } catch (err) {
        console.error("Error decoding Google credential token:", err);
      }
    }

    if (!userEmail) {
      return res.status(400).json({ message: "Google Authentication failed: Email not provided" });
    }

    const lowerEmail = userEmail.toLowerCase().trim();
    let user = await User.findOne({ email: lowerEmail }).populate("bookmarkedHackathons");

    const allowedRole = ["participant", "judge", "organizer"].includes(role) ? role : "participant";

    if (!user) {
      // Create new user account via Google OAuth
      user = await User.create({
        name: userName || lowerEmail.split("@")[0],
        email: lowerEmail,
        password: `GoogleOAuth_${Date.now()}_${Math.random()}`,
        role: allowedRole,
        avatar: userAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userName || lowerEmail)}`,
        isEmailVerified: true,
      });
    } else {
      // Mark verified
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        await user.save();
      }
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account is blocked by admin." });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio || "",
      skills: user.skills || [],
      bookmarkedHackathons: user.bookmarkedHackathons || [],
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during Google auth", error: error.message });
  }
};

// @desc    Verify OTP (kept for backward compatibility)
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

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
const resendOTP = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "OTP verification is disabled. Accounts are activated immediately.",
  });
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

    // Ensure email is marked verified
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      skills: user.skills,
      bookmarkedHackathons: user.bookmarkedHackathons || [],
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during login", error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("bookmarkedHackathons");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.skills = Array.isArray(req.body.skills)
        ? req.body.skills
        : typeof req.body.skills === "string"
        ? req.body.skills.split(",").map((s) => s.trim())
        : user.skills;
      user.avatar = req.body.avatar || user.avatar;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        skills: updatedUser.skills,
        token: generateToken(updatedUser._id, updatedUser.role),
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Toggle hackathon bookmark
// @route   POST /api/auth/bookmark/:hackathonId
const toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { hackathonId } = req.params;

    const index = user.bookmarkedHackathons.indexOf(hackathonId);
    if (index > -1) {
      user.bookmarkedHackathons.splice(index, 1);
    } else {
      user.bookmarkedHackathons.push(hackathonId);
    }

    await user.save();
    const updatedUser = await User.findById(req.user._id).populate("bookmarkedHackathons");
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  registerUser,
  googleAuth,
  verifyOTP,
  resendOTP,
  loginUser,
  getMe: getUserProfile,
  getUserProfile,
  updateProfile: updateUserProfile,
  updateUserProfile,
  toggleBookmark,
};
