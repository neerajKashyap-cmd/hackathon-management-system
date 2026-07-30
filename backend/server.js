const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const seedAdmin = require("./utils/seedAdmin");

dotenv.config();

// Connect DB & Seed Admin
connectDB().then(() => {
  seedAdmin();
});

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Hackathon Management System API is running" });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/teams", require("./routes/teamRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/submissions", require("./routes/submissionRoutes"));
app.use("/api/judging", require("./routes/judgingRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/organizer", require("./routes/organizerRoutes"));
app.use("/api/hackathons", require("./routes/hackathonRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
