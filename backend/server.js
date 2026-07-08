require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const passport = require("./config/passport");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(passport.initialize());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/squad", require("./routes/squadRoutes"));
app.use("/api/habit", require("./routes/habitRoutes"));

// API health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Squad Habits API is running" });
});

// Serve the built frontend (frontend/dist) in production
const frontendDist = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDist));

// Everything under /api is handled above (or falls through to Express's
// own 404). Anything else is a frontend route — e.g. /login, /dashboard,
// /squad/:id, /auth/callback — and should get index.html so React Router
// can render it, even on a hard refresh/direct URL visit.
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log("MongoDB connection error:", err));