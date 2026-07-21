const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Hackathon Management System API is running" });
});

// Routes will be added here as the project grows:
// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/teams", require("./routes/teamRoutes"));
// app.use("/api/submissions", require("./routes/submissionRoutes"));
// app.use("/api/judging", require("./routes/judgingRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
