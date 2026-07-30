const User = require("../models/User");

const seedAdmin = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@hackathon.com").toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || "adminpassword123";

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: "Super Administrator",
        email: adminEmail,
        password: adminPassword,
        role: "admin",
        isEmailVerified: true,
        bio: "System Administrator & Platform Overseer",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=SuperAdmin",
      });
      console.log(`[SEED] Created default Admin account: ${adminEmail}`);
    } else {
      // Ensure existing admin account is set to admin role
      if (admin.role !== "admin") {
        admin.role = "admin";
        await admin.save();
      }
    }
  } catch (err) {
    console.error("[SEED] Admin check failed:", err.message);
  }
};

module.exports = seedAdmin;
