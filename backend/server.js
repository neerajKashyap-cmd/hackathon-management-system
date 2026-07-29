const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const seedDatabase = require("./utils/seedData");

dotenv.config();

// Connect DB and seed initial sample data
connectDB().then(() => {
  seedDatabase();
});

const app = express();
const allowedOrigin = process.env.FRONTEND
app.use(
  cors({
    origin: `${allowedOrigin}`,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
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
